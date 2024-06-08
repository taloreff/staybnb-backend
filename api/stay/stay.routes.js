import express from 'express'
import { addStay, getStays, getStay, removeStay, updateStay } from './stay.controller.js'
import { log } from '../../middlewares/logger.middleware.js'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

router.get('/', log, getStays)
router.get('/:stayId', log, getStay)
router.delete('/:stayId', log, requireAuth, removeStay)
router.put('/:stayId', log, requireAuth, updateStay)
router.post('/', log, requireAuth, addStay)

export const stayRoutes = router