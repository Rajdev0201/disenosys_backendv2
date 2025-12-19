const mongoose = require("mongoose");


const booknowSchema = new mongoose.Schema({
  name:{
     type:String,
     required:true
    },
    email:{
     type:String,
     required:true
    },
    phone:{
    type:String,
     required:true
    },
},{timestamps:true});

module.exports = mongoose.model("booknow",booknowSchema)