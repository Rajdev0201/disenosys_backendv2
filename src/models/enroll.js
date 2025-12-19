const mongoose = require("mongoose");

const enrollSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"user",
    required: true
  },
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  mobile:{
    type:String,
    required:true
  },
  courseName:{
    type:String,
    required:true
  },
  
},{timestamps:true});

module.exports = mongoose.model("enroll",enrollSchema)