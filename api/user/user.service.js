import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
// import { stayService } from '../stay/stay.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

export const userService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername // Used for Login
}

const users = await query()

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('users')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = new ObjectId(user._id).getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}


async function getById(userId) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ _id: new ObjectId(userId) })
        delete user.password

        user.stays = await stayService.query({ byUserId: new ObjectId(user._id) })
        user.stays = user.stays.map(stay => {
            delete stay.byUser
            return stay
        })

        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(fullname) {
    try {
        console.log(" getByUsername fullname", fullname)
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ fullname })
        return user
    } catch (err) {
        logger.error(`while finding user by fullname: ${fullname}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('users')
        await collection.deleteOne({ _id: new ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: new ObjectId(user._id), // needed for the returnd obj
            fullname: user.fullname,
            score: user.score,
        }
        const collection = await dbService.getCollection('users')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl,
            email: user.email,
        }
        logger.debug(userToAdd)
        const collection = await dbService.getCollection('users')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [{
            username: txtCriteria
        },
        {
            fullname: txtCriteria
        }
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}