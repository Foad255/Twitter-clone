import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"

export const getNotification = async (req , res) => {
 try {
  const userId = req.user._id
  const user = await User.findById(userId)
  if (!user) return res.status(404).json({error: "Authontication not found"})
  const notification = await Notification.find({to:userId}).populate({path:'from', select:"username profileImg"})

  res.status(200).json(notification)
 } catch (err) {
  console.log(err)
  res.status(500).json({error:"Internal server error"})
 }
}

export const deleteNotification = async (req,res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({error: "Authontication not found"})
    await Notification.deleteMany({to:userId})
    res.status(200).json({message:"Notification has been deleted successfully"})
  } catch (err) {
    res.status(500).json({error:"Internal server error"})
   }
}
