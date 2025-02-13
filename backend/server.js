import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import {v2 as cloudinary} from 'cloudinary'

import connectMongodb from './db/connectMongodb.js'
import cookieParser from 'cookie-parser'
import authMiddleWare from './routes/authMiddleWare.js'
import userMiddleWare from './routes/userMiddleWare.js'
import postMiddleWare from './routes/postMiddleWare.js'
import notificationMiddleWare from './routes/notificationMiddleWare.js'

dotenv.config()

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_NAME
})
const app = express();
const PORT = process.env.PORT || 5000
const __dirname = path.resolve()

// parsing data with JSON and get it under req.body
app.use(express.json({limit: '5mb'}))
// Using req.body
app.use(express.urlencoded({extended: false}))

// cookie-parser middleware
app.use(cookieParser())

// use authMiddleWare (express.Router();) when hitting /api/auth  with any Method
app.use('/api/auth', authMiddleWare)

// use userMiddleWare when hitting /user with any method
app.use('/api/user',  userMiddleWare)

app.use('/api/post', postMiddleWare)

app.use('/api/notifications', notificationMiddleWare)

if ( process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')))
}

  app .get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  })

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  connectMongodb()
}) 
