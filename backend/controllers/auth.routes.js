import  generateTokenAndSetCookie  from '../lib/utils/generateToken.js';
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import passwordChecker from './addtionalFunctions/passwordChecker.js';

export const signup = async (req,res) => {
  try {
    const {username , fullName , password , email} = req.body

    // ensure all needed  data is received
    if (!username) return res.status(400).json({error:'please enter a username'})
    if (!fullName) return res.status(400).json({error:'please enter a fullName'})
    if (!email)    return res.status(400).json({error:'please enter an email'  })
    if (!password) return res.status(400).json({error:'please enter a password'})

    // Ensure of validity of email
    const emailRegex = /^(?=.{1,256})(?=.{1,64}@.{1,255}$)(?=\S)(?!.*\s)(?!.*?\.\.)(?:(?!.*\.\.).)*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) {
      return res.status(400).json({error: 'Invaild Email format'})
    }
    
    // Ensure the username and email are unique
    const existingUser  = await  User.findOne({userName:username})
    const existingEmail = await  User.findOne({email})

    if (existingUser) {
      return res.status(400).json({error:"Username is already taken"})
    } 
    if (existingEmail) {
      return res.status(400).json({error: "Email is already taken"})
    }

    // Validity of Password
    const {result, message, recommended} = passwordChecker(password)
    let requirement = 'digit & uppercase & lowerCase & 6<?<20 & no aaa or ccc '
    if (result > 0) {
     return  res.status(400).json({toAddortoReplaceOrtoRemove:result, error:message, requirement:requirement})
    }
    // Password encryption
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create new document
    const newUser = new User({
      userName:username,
      fullName,
      email,
      password:hashedPassword
    })

    if(newUser) {
      // generate a token
      generateTokenAndSetCookie(newUser._id,res)

      newUser.save()

      res.status(201).json({
        username: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg
      })
    } else {
      res.status(400).json({error:'invalid user data'})
    }

  } catch (err) {
    res.status(500).json({error: "internal Server Error"})
    console.log('Internal Error', err)
  }
}

export const signin = async (req,res) => {
  try {
    // get the data
    const {username , password} = req.body

    // Serch for username
    const user = await User.findOne({userName:username}).exec()

    if (!user) {
     return res.status(404).json({success: false, error:'User not found'})
    }

    // Verify the password 
    const passwordMatch = await bcrypt.compare(password,user.password)
    if(passwordMatch) {
      // JWT
      generateTokenAndSetCookie(user._id, res)
      // Send user data
        res.status(200).json({
          username:user.userName,
          fullName:user.fullName,
          email:user.email,
          followers:user.followers,
          following:user.following,
          profileImg:user.profileImg,
          coverImg:user.coverImg
        })
    } else {
      res.status(400).json({error:'Wrong password'})
    }
  } catch (err) {
      console.log('Internal Error', err)
      res.status(500).json({error:'Internal Server Error'})
  }
}

export const signout = async (req,res) => {
  try {
    // remove the cookie
    res.cookie('jwt', '', {maxAge:0})
    res.status(200).json({message:"Logged out successfully"})
  } catch (err) {
    console.log('Internal Server Error', err)
    res.status(500).json({message:"Internal Server Error"})
  }
}

export const getMe = async (req,res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({error:"Internl Server Error"})
  }
}
