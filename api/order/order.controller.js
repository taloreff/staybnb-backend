import { orderService } from './order.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getOrder(req, res) {
    try {
        const order = await orderService.getById(req.params.id)
        res.send(order)
    } catch (err) {
        logger.error('Failed to get order', err)
        res.status(400).send({ err: 'Failed to get order' })
    }
}

export async function getOrders(req, res) {
    try {
        const filterBy = {
            // txt: req.query?.txt || '',
            // minBalance: +req.query?.minBalance || 0
        }
        const orders = await orderService.query(filterBy)
        res.send(orders)
    } catch (err) {
        logger.error('Failed to get orders', err)
        res.status(400).send({ err: 'Failed to get orders' })
    }
}

export async function deleteOrder(req, res) {
    try {
        await orderService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete order', err)
        res.status(400).send({ err: 'Failed to delete order' })
    }
}

export async function updateOrder(req, res) {
    try {
        const order = req.body
        const savedOrder = await orderService.update(order)
        res.send(savedOrder)
    } catch (err) {
        logger.error('Failed to update order', err)
        res.status(400).send({ err: 'Failed to update order' })
    }
}

export async function addOrder(req, res) {
    const { hostId, buyer, totalPrice, startDate, endDate, guests, stay, status } = req.body
    let orderToSave = { hostId, buyer, totalPrice, startDate, endDate, guests, stay, status }

    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Not authenticated')

    try {
        const savedOrder = await orderService.add(orderToSave)
        res.send(savedOrder)
    } catch (err) {
        logger.error(`Cannot save order`, err)
        res.status(400).send(`Cannot save order`)
    }
}