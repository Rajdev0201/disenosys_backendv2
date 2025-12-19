const { json } = require("express");
const enroll = require("../models/enroll");



exports.enrollPost = async (req,res) => {
 try{
   const {name,mobile,email,courseName} = req.body;
   const user = req.user._id;

   if(!user){
          return res.status(400).json({message:"Please signin your account"})
   }
   if(!name || !mobile || !email || !courseName){
    return res.status(400).json({message:"All fields are required"});
   }
   const newEnroll = enroll({
    name:name,
    mobile:mobile,
    email:email,
    courseName:courseName,
    user:user
   })
   await newEnroll.save();
   return res.status(201).json({message:"Enroll Form Submitted",newEnroll})
 }catch(err){
    return res.status(500).json({message:"something wrong",err})
 }
}