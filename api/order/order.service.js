import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
// import { stayService } from '../stay/stay.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

export const orderService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
}

const users = await query()

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('orders')
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


async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('orders')
        const order = await collection.findOne({ _id: new ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order by id: ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('orders')
        await collection.deleteOne({ _id: new ObjectId(orderId) })
    } catch (err) {
        logger.error(`cannot remove user ${orderId}`, err)
        throw err
    }
}

async function update(order) {
    try {
        // peek only updatable properties
        const orderToSave = {
            _id: new ObjectId(user._id),
            stay: order.stay,
            status: order.status,
        }
        const collection = await dbService.getCollection('orders')
        await collection.updateOne({ _id: orderToSave._id }, { $set: orderToSave })
        return orderToSave
    } catch (err) {
        logger.error(`cannot update user ${order._id}`, err)
        throw err
    }
}

async function add(order) {
    try {
        // peek only updatable fields!
        const orderToAdd = {
            totalPrice: order.totalPrice,
            startDate: order.startDate,
            endDate: order.endDate,
            guests: order.guests,
            status: order.status,
            hostId: order.hostId,
            buyer: order.buyer,
            stay: order.stay,
            status: order.status
        }
        logger.debug(orderToAdd)
        const collection = await dbService.getCollection('orders')
        await collection.insertOne(orderToAdd)
        return orderToAdd
    } catch (err) {
        logger.error('cannot add order', err)
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