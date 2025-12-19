const mongoose = require("mongoose");


const placementSchema = new mongoose.Schema({
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
    course:{
    type:String,
    required:true
    }

},{timestamps:true})


module.exports = mongoose.model("placementprograms",placementSchema)