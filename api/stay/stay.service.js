import fs from 'fs'
import { utilService } from "../../services/util.service.js"
import { dbService } from '../../services/db.service.js';
import { ObjectId } from 'mongodb'
import { logger } from '../../services/logger.service.js';

const PAGE_SIZE = 2
// const stays = utilService.readJsonFile('data/stays.json')
const collectionName = 'stays'

export const stayService = {
    query,
    getById,
    remove,
    save
}

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection(collectionName)
        const stayCursor = await collection.find(criteria)

        if (filterBy.pageIdx !== undefined) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE
            stayCursor.skip(startIdx).limit(PAGE_SIZE)
        }

        const stays = await stayCursor.toArray()
        return stays
    } catch (err) {
        logger.error(err)
        throw err
    }
}

async function getById(stayId) {
    // try {
    //     const stay = stays.find(stay => stay._id === stayId)
    //     return stay
    // } catch (err) {
    //     throw err
    // }
    try {
        const collection = await dbService.getCollection(collectionName)
        const stay = collection.findOne({ _id: new ObjectId(stayId) })
        if (!stay) throw `Couldn't find stay with _id ${stayId}`
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}


async function remove(stayId, loggedinUser) {
    // try {
    //     const StayIdx = Stays.findIndex(Stay => Stay._id === StayId)
    //     if (StayIdx === -1) throw `Cannot find Stay with _id ${StayId}`

    //     const Stay = Stays[StayIdx]
    //     if (!loggedinUser.isAdmin && Stay.owner._id !== loggedinUser._id) throw { msg: `Not your Stay`, code: 403 }

    //     Stays.splice(StayIdx, 1)
    //     _saveStaysToFile()
    // } catch (err) {
    //     throw err
    // }
    try {
        const collection = await dbService.getCollection(collectionName)
        const { deletedCount } = await collection.deleteOne({ _id: new ObjectId(stayId) })
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stayToSave, loggedinUser) {
    try {
        stayToSave.owner = loggedinUser
        const collection = await dbService.getCollection(collectionName)
        await collection.insertOne(stayToSave)
        return stayToSave
    } catch (err) {
        logger.error('stayService, can not add stay : ' + err)
        throw err
    }
}

async function update(stay) {
    try {
        // Peek only updateable fields
        const stayToSave = {
        }
        const collection = await dbService.getCollection(collectionName)
        await collection.updateOne({ _id: new ObjectId(stay._id) }, { $set: stayToSave })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}


async function removeStayMsg(stayId, msgId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        await collection.updateOne({ _id: new ObjectId(stayId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

async function save(stayToSave) {
    try {
        const collection = await dbService.getCollection('stays')
        const savedStay = await collection.insertOne(stayToSave)
        stayToSave._id = savedStay.insertedId
        logger.debug(stayToSave)
        return stayToSave
    } catch (err) {
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.category_tag) {
        criteria.labels = {
            $elemMatch: {
                $regex: filterBy.category_tag,
                $options: 'i'
            }
        }
    }

    if (filterBy.amenities.length) {
        criteria.amenities = { $all: filterBy.amenities }
    }

    if (filterBy.property_types.length) {
        criteria.property_types = { $in: filterBy.property_types }
    }

    if (filterBy.price_min || filterBy.price_max !== Infinity) {
        criteria.price = {}
        if (filterBy.price_min) criteria.price.$gte = +filterBy.price_min
        if (filterBy.price_max !== Infinity) criteria.price.$lte = +filterBy.price_max
    }

    if (filterBy.beds) {
        criteria.beds = { $gte: +filterBy.beds }
    }

    if (filterBy.bedrooms) {
        criteria.bedrooms = { $gte: +filterBy.bedrooms }
    }

    if (filterBy.bath) {
        criteria.bath = { $gte: +filterBy.bath }
    }

    if (filterBy.capacity) {
        criteria.capacity = { $gte: +filterBy.capacity }
    }

    if (filterBy.country) {
        criteria['loc.country'] = { $regex: filterBy.country, $options: 'i' }
    }

    if (filterBy.startDate && filterBy.endDate) {
        criteria.availableDates = {
            $elemMatch: {
                start: { $lte: new Date(filterBy.startDate) },
                end: { $gte: new Date(filterBy.endDate) }
            }
        }
    }

    return criteria
}

function _saveStaysToFile(path = './data/stays.json') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(stays, null, 4)
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}