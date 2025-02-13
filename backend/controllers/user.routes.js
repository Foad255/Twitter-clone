import bcrypt from 'bcryptjs'
import {v2 as cloudinary} from 'cloudinary'

import User from "../models/user.model.js"
import passwordChecker from "./addtionalFunctions/passwordChecker.js"
import Notification from '../models/notification.model.js'

export const getUser  = async (req,res) => {
  try {
      const {username} = req.params
      const targetUser = await User.findOne({userName:username}).select('-password')
      if(!targetUser) {
        return res.status(400).json({error: 'User not found'})
      }
      res.status(200).json({message: targetUser})
  } catch (err) {
      res.status(500).json({error: "Internal Server Error"})
  } 
} 

export const followOrUnfollow = async (req,res) => {
  try {  const {id} = req.params
  // the user who is getting follow/unfollow
  const targetUser = await User.findById(id)
  
  // the user who is giving follow/unfollow and here protectedRoute come to the game
  const currentUser = await User.findById(req.user._id)

  if(!targetUser || !currentUser) {
    return res.status(404).json({error: "User not found"})
  }
  // You can't follow/unfollow yourself
  if (id === req.user._id.toString()) {
  return res.status(400).json({error:"Can't follow your self"})
  }
  // follow or unfollow
  const isFollowing = currentUser.following.includes(id)
  
  if(isFollowing) {
    // update follwoing (current user)
    await User.findByIdAndUpdate(req.user._id, {$pull: {following:id}})
    // update followers (target user)
    await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}})
    res.status(200).json({message: "Follow Removed"})
  } else {
    // update follwoing (current user)
    await User.findByIdAndUpdate(req.user._id, {$push: {following:id}})
    // update followers (target user)
    await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}})

    const notification = new Notification({
      type: "follow",
      from: req.user._id,
      to: targetUser._id,
    })
    await notification.save()
    res.status(200).json({message: "Follow Added"})
  }
} catch (err) {
    res.status(500).json({error: "Internal Server Error"})
    console.log(err)
  }
}


export const suggestedUsers = async (req, res) => {
    const currentUser = await User.findById(req.user._id).select('following');
    if (!currentUser) {
      return res.status(404).json({ message: 'No following' });
    }
    
      try {
        // Find users followed by the current user
        const usersFollowedByMe = await User.findById(req.user._id).select('following');
        
        // Fetch random users excluding the current user
        const users = await User.aggregate([
          { $match: { _id: { $ne: req.user._id } } },
          { $sample: { size: 10 } },
        ]);
    
        // Filter out users who are already followed
        const filteredUsers = users.filter(
          (user) => !usersFollowedByMe.following.includes(user._id)
        );
    
        // TODO:  better algorithm

        // Select top 4 suggestions
        const suggestedUsers =  filteredUsers.slice(0, 4);
    
        const finalSuggest = suggestedUsers
        // Prepare and send the response
        res.status(200).json(finalSuggest);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}
  
export const updatedUser = async (req,res) => {
  try {
      // get data
  let { currentPassword, newPassword, username , fullname, bio , link, profileImg, coverImg } = req.body
  // verify User
  const user = await User.findById(req.user._id)
  if(!user) {
    return res.status(404).json({error:"User not found"})
  }
  // if you're thinking to change the password, you've got to give the two passwords
  if (!currentPassword && newPassword || currentPassword && !newPassword) {
    return res.status(400).json({error:"Password is missing"})
  }
  // compare passwords
  if (currentPassword && newPassword)  {
    if(currentPassword === newPassword) return res.status(400).json({error:"Can't be the same"})
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({error:"Wrong password"})
    }    
    // password requirements
    const {result, message, recommended} = passwordChecker(newPassword)
    let requirement = 'digit & uppercase & lowerCase & 6<?<20 & no aaa or ccc '
    if (result > 0) {
      console.log(recommended)
     return  res.status(400).json({toAddortoReplaceOrtoRemove:result, message:message, error:requirement})
    }
    // recrypt the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
  }



if (profileImg) {
    if(user.profileImg) {
      await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0])
    }
   const uploadeResponse =   await cloudinary.uploader.upload(profileImg)
    profileImg = uploadeResponse.secure_url
  }

if (coverImg) {
    if(user.coverImg) {
      await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0])
    }
  const uploadeResponse =   await cloudinary.uploader.upload(coverImg)
    coverImg = uploadeResponse.secure_url
  }

  user.userName = username || user.userName;
  user.fullName = fullname || user.fullName;
  user.bio = bio || user.bio;
  user.link = link || user.link;
  user.profileImg = profileImg || user.profileImg;
  user.coverImg = coverImg || user.coverImg;
  
  await user.save()

 const updatedUser = await User.findById(req.user._id).select('-password')
 
  res.status(200).json({message:"updated successfully",user:updatedUser})
  return res.status(200)
  } catch (err) {
    console.log(err)
    res.status(500).json({error: "Internal Server Error"})
  }
}

