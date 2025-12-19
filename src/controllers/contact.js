const { json } = require("express");
const enroll = require("../models/enroll");
const contact = require("../models/contact");



exports.contactPost = async (req,res) => {
 try{
   const {fname,lname,mobile,email,message} = req.body;

   if(!fname || !lname || !mobile || !email || !message){
    return res.status(400).json({message:"All fields are required"})
   }
   const newContact = contact({
    fname:fname,
    lname:lname,
    mobile:mobile,
    email:email,
    message:message
   })
   await newContact.save();
   return res.status(201).json({message:"Enroll Form Submitted",newContact})
 }catch(err){
    return res.status(500).json({message:"something wrong",err})
 }
}