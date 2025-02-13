import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'

const protectedRoute = async (req,res,next) => {
  try {
    // get the token from cookie
    const token = req.cookies.jwt
    if (!token) {
      return res.status(401).json({error: "Unauthorized: No Token Provided"})
    }

    // decode the toekn
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET)

    if (!decodeToken) {
      return res.status(401).json({error:"Unauthorized: invalid Token"})
    }
    // find our targed user by the id which we provided it iin the token before
    const userId = decodeToken.userId
    const targetUser = await User.findById(userId).select('-password')

    // Attaching the user -password object to the req object
    req.user = targetUser

    if (!targetUser) {
      return res.status(404).json({error: "User not found"})
    }
    next()
  } catch(err) {
     console.log(err)
      return res.status(500).json({error: 'Internal Server Error'})
   
  }
}

export default protectedRoute