import { stayService } from "./stay.service.js"
import { authService } from '../auth/auth.service.js'
import { loggerService } from "../../services/logger.service.js"

export async function getStays(req, res){
    const { title, severity, label, pageIdx, sortBy } = req.query
    const filterBy = { title, severity: +severity, label, pageIdx, sortBy }

    try {
        const loggedinUser = authService.validateToken(req.cookies.loginToken)
        const stays = await stayService.query(filterBy)
        res.send(stays)
    } catch (err) {
        loggerService.error(`Cannot get stays`, err)
        res.status(400).send(`Cannot'nt get stays`)
    }
}

export async function getStay(req, res) {
    try {
        const stayId = req.params.stayId
        // console.log('stayId:', stayId)
        let visitedStays = req.cookies.visitedStays || []
        if (visitedStays.length > 2) return res.status(401).send('Wait for a bit');
        if (!visitedStays.includes(stayId)) visitedStays.push(stayId) 
        res.cookie('visitedStays', visitedStays, { maxAge: 7 * 1000 })

        const stay = await stayService.getById(stayId)
        // console.log('stay:', stay)
        res.send(stay)
    } catch (err) {
        loggerService.error(`Cannot get stay`, err)
        res.status(400).send(`Cannot get stay`)
    }
}

export async function removeStay(req, res) {
    
    const {stayId} = req.params
    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Not authenticated')

    try {
        await stayService.remove(stayId, req.loggedinUser)
        res.send('deleted')
    } catch (err) {
        loggerService.error(`Cannot remove stay`, err)
        res.status(400).send(`Cannot remove stay`)
    }
}

export async function updateStay(req, res){
    const { _id, title, severity, description, labels } = req.body 
    let stayToSave = { _id, title, severity: +severity, description, labels }

    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Not authenticated')

    try {
        const savedStay = await stayService.save(stayToSave, req.loggedinUser)
        res.send(savedStay)
    } catch (err) {
        loggerService.error(`Cannot save stay`, err)
        res.status(400).send(`Cannot save stay`)
    }
}

export async function addStay(req, res){
    const { title, severity, description, labels } = req.body 
    let stayToSave = { title, severity: +severity, description, labels }
    
    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Not authenticated')

    try {
        const savedStay = await stayService.save(stayToSave, req.loggedinUser)
        res.send(savedStay)
    } catch (err) {
        loggerService.error(`Cannot save stay`, err)
        res.status(400).send(`Cannot save stay`)
    }
}