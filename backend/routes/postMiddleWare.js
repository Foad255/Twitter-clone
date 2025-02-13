import express from 'express'
import protectedRoute from '../middleWares/protectedRoute.js'
import {createPost , deletePost, addComment, likeOrdislike, getAllPosts, getLikedPosts, getFollwoingPosts, getUserPosts } from '../controllers/post.routes.js'
const router = express.Router()


router.get('/all',protectedRoute,getAllPosts)
router.get('/following', protectedRoute, getFollwoingPosts)
router.get('/liked/:id',protectedRoute, getLikedPosts)
router.get('/user/:username', protectedRoute, getUserPosts)
router.post('/create', protectedRoute, createPost)
router.delete('/delete/:id', protectedRoute, deletePost)
router.post('/comment/:postId', protectedRoute, addComment)
router.post('/like/:postId', protectedRoute, likeOrdislike)


export default router

