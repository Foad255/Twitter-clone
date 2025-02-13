import express from 'express'
import {signup, signin, signout, getMe} from '../controllers/auth.routes.js'
import protectedRoute  from '../middleWares/protectedRoute.js'

const router = express.Router()

router.get('/me', protectedRoute , getMe)
router.post('/signup', signup)
router.post('/signin', signin)
router.post('/signout',signout)
 
export default router

