import express from 'express'
import { getUser, followOrUnfollow, suggestedUsers, updatedUser} from '../controllers/user.routes.js'
import protectedRoute from '../middleWares/protectedRoute.js'

const router = express.Router()

// get user by username, protectedRoute for verify who's searching 
router.get('/profile/:username', protectedRoute ,getUser)

// follow someone by id , protectecRoute for verify who's following
router.post('/follow/:id', protectedRoute, followOrUnfollow)

// suggested users 
router.get('/suggestions', protectedRoute, suggestedUsers)

// update user information
router.post('/update', protectedRoute, updatedUser)

export default router