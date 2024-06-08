import express from 'express'
import { addStay, getStays, getStay, removeStay, updateStay } from './stay.controller.js'
import { log } from '../../middlewares/log.middleware.js'
import { requireUser } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

router.get('/', log, getStays)
router.get('/:stayId', log, getStay)
router.delete('/:stayId', log, requireUser, removeStay)
router.put('/:stayId', log, requireUser, updateStay)
router.post('/', log, requireUser, addStay)

export const stayRoutes = router