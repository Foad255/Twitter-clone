import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"
import {v2 as cloudinary} from 'cloudinary'

export const createPost = async (req , res) => {
  try {
  const { text } = req.body 
  let {img} = req.body
  const userId = req.user._id
  const user = await User.findById(userId)

  if (!user) {
    return res.status(404).json({error:"User Not found"})
  }
  if (!img && !text) {
    return res.status(404).json({error:'No text or Img is provided'})
  }

  if (img) {
    const uploadeResponse = await cloudinary.uploader.upload(img)
    img = uploadeResponse.secure_url
  }

 const post = await new Post({
  user:userId,
  text,
  img
})
  await post.save()
  res.status(201).json({message: post})
  } catch (err) {
    res.status(500).json({error:"Internal Server Error"})
    console.log('Creating error' , err)
  }
}

export const deletePost = async (req,res) => {
  try {
  const {id} = req.params
  const post = await Post.findById(id)
  // this post is exist
  if(!post) return res.status(404).json({error:"Post not found"})

  // you're the owner so you can delete
  if(!post.user._id === req.user._id){
    return res.statu(400).json({error:"You're not authorized to delete this post"})
  }
  
  if (post.img) {
  await cloudinary.uploader.destroy(post.img.split('/').pop().split('.')[0])
  }

  await  Post.findByIdAndDelete(id);
  res.status(200).json({message: "Post Deleted successfully"})
  } catch (err) {
    res.status(500).json({error: "Internal Server Error"})
    console.log(err)
  }
}

export const addComment = async (req,res) => {
  try {
    // which Post
    const {postId} = req.params
    // The content of the comment
    const {text} = req.body

    const userId = req.user._id
    const user = User.findById(userId)
    if (!user) return res.status(404).json({error:"You need to sign in"})
    if (!text) return res.status(404).json({error:"No text provided"})
    if (!postId) return res.status(404).json({error:"Post not found"})
    
    await Post.findByIdAndUpdate(postId, {
      $push: {
        comment: {
          user: userId,
          text,
        }
      }
    })
    res.status(200).json({message: "Comment Added successfully"})
  } catch (err) {
    console.log(err)
    res.status(500).json({error: "Internal Server Error"})
  }
}


export const likeOrdislike = async (req,res) => {
  try {
    const {postId} = req.params
    const post = await Post.findById(postId)
    const userId = req.user._id
    const user = await User.findById(userId)

    if (!user) return res.status(404).json({error:"You need to sign in"})
    if (!post) return res.status(404).json({error:"Post not found"})
    
    // Like or disLike
    const isLike = post.likes.includes(userId)
    
    if(isLike) {
    await Post.findByIdAndUpdate(postId,{$pull:{likes:userId}},{new: true})
    await User.findByIdAndUpdate(userId, {$pull:{LikePosts:postId}})
    return res.status(200).json({message:"Like Removed"})
    }

    await Post.findByIdAndUpdate(postId,{$push:{likes:userId}},{new: true})
    await User.findByIdAndUpdate(userId, {$push:{LikePosts:postId}})

    
    const notification = new Notification({
      type: "like",
      from: userId,
      to: post.user
    })
    await notification.save()
    res.status(200).json({message:"Like added Successfully"})
  } catch (err) {
    console.log(err)
    res.status(500).json({error:"Internal Server Error"})
  }
}

export const getAllPosts = async (req,res) => {
  try {
    // populate to get the ref
    const posts = await Post.find().sort({ createdAt: -1 }).populate({
      path:'user', 
      select:'-password'
    }).populate({
      path: 'comment.user',
      select: '-password'
    })

    if (posts.length === 0) {
      return res.status(200).json([])
    }
    res.status(200).json({posts})
  } catch (err) {
    res.status(500).json({error:"Internal Server Error"})
  }
}

export const getLikedPosts = async (req,res) => {
  try {
    const {id} = req.params
    const user = await User.findById(id)
    if (!user) return res.status(404).json({error:"You need to sign in"})
      // first go to posts then get the information of that post base on the postId you have in LikedPost
    // liked page has information about user owner the post and users comment at 
    const LikedPosts = await Post.find({_id: {$in: user.LikePosts}})
    .populate({
      path:'user',
      select:"-password"
    }).populate({
      path:'comment.user',
      select:'-password'
    })
    res.status(200).json({posts:LikedPosts})
  } catch (err) {
    console.log(err)
    res.status(500).json({error:"Internal Server Error"})
  }
}

export const getFollwoingPosts = async (req,res) => {
  try {
    const userId = req.user._id 
    const user = await User.findById(userId)
    if (!user) return res.staus(404).json({error: 'Authontication not found'})
    const following = user.following
    if(following.length === 0) return res.status(200).json([])
   const feedPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1})
    .populate({path:'user', select:"-password"})
    .populate({path:'comment.user',select:"-password"})
    res.status(200).json({posts:feedPosts})
  } catch (err) {
    res.status(500).json({error:"Internal Server Error"})
  }
}
 
export const getUserPosts = async (req,res) => {
  try {
  const {username} = req.params
  const user = await User.findOne({userName: username})
  if(!user) return res.status(404).json({error:"User not found"})
  
  const posts = await Post.find({user: user._id}).sort({createdAt: -1})
  .populate({path:'user', select:'-password'})
  .populate({path:'comment.user', select:'-password'})

  res.status(200).json({posts: posts})
  } catch (err) {
    res.status(500).json({error:"internal server error"})
  }
}