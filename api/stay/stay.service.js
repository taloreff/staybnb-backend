import fs from 'fs'
import { utilService } from "../../services/util.service.js"
import { dbService } from '../../services/db.service.js';
import { ObjectId } from 'mongodb'

const PAGE_SIZE = 2
// const stays = utilService.readJsonFile('data/stays.json')
const collectionName = 'stay'

export const stayService = {
    query,
    getById,
    remove
}

async function query(filterBy = {}) {
    // let filteredstays = [...stays]
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection(collectionName)
        const stayCursor = await collection.find(criteria)
    try {
        if (filterBy.label) { 
            filteredStays = filteredStays.filter(stay => stay.labels.includes(filterBy.label))
        }
        if (filterBy.title) {
            const regExp = new RegExp(filterBy.title, 'i')
            filteredStays = filteredStays.filter(stay => regExp.test(stay.title))
        }
        if (filterBy.severity) {
            filteredStays = filteredStays.filter(stay => stay.severity >= filterBy.severity)
        }
    

        // Sort would come here
        if (filterBy.sortBy) {
            if (filterBy.sortBy === 'Title') {
              filteredStays.sort((a, b) => a.title.localeCompare(b.title))
            } else if (filterBy.sortBy === 'Severity') {
              filteredStays.sort((a, b) => a.severity - b.severity)
            } else if (filterBy.sortBy === 'CreatedAt') {
              if (filterBy.sortDir === '-1') {
                filteredStays.sort((a, b) => b.createdAt - a.createdAt)
              } else {
                filteredStays.sort((a, b) => a.createdAt - b.createdAt)
              }
            }
        }

        if (filterBy.pageIdx !== undefined) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE
            filteredStays = filteredStays.slice(startIdx, startIdx + PAGE_SIZE)
        }
        

        return filteredStays
    } catch (err) {
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

// async function save(StayToSave, loggedinUser) {
//     try {
//         if (StayToSave._id) {
//             const idx = Stays.findIndex(Stay => Stay._id === StayToSave._id)
//             if (idx < 0) throw `Cant find Stay with _id ${StayToSave._id}`

//              const Stay = Stays[idx]
//             if (!loggedinUser?.isAdmin && Stay.owner._id !== loggedinUser?._id) throw `Not your Stay`

//             Stays.splice(idx, 1, {...Stay, ...StayToSave })
//         } else {
//             StayToSave._id = utilService.makeId()
//             StayToSave.owner = { _id: loggedinUser._id, fullname: loggedinUser.fullname }
//             StayToSave.createdAt = Date.now()
//             Stays.push(StayToSave)
//         }
//         await _saveStaysToFile()
//         return StayToSave
//     } catch (err) {
//         throw err
//     }
// }

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.txt) {
        criteria.vendor = { $regex: filterBy.txt, $options: 'i' }
    }


    if (filterBy.minSpeed) {
        criteria.speed = { $gt: filterBy.minSpeed }
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