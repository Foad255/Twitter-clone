import express from 'express'
import protectedRoute from '../middleWares/protectedRoute.js'
import { getNotification, deleteNotification} from '../controllers/notification.route.js'

const router = express.Router()

router.get('/', protectedRoute, getNotification)
router.delete('/', protectedRoute, deleteNotification)

export default router
