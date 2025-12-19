const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
// const bcrypt = require("bcrypt")
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    userName:{
     type:String,
     required:true
    },
    userEmail:{
     type:String,
     required:true
    },
    password:{
    type:String,
     required:true
    },
    phoneNumber:{
    type:Number,
    },
    about:{
       type:String,
    },
    bio:{
    type:String,
    },
    age:{
    type:String,
    },
   skills: {
    type:[String],
   }
},{timestamps:true})


//create a token for user

userSchema.methods.getJwtToken = function() {
    return jwt.sign({_id : this._id}, "Dis12")
}

userSchema.methods.getresetPasswordToken = function (){

    const token = crypto.randomBytes(20).toString('hex');

    
    this.resetPasswordToken =  crypto.createHash('sha256').update(token).digest('hex');

    this.resetPasswordTokenExpire = Date.now() + 20 * 60 * 1000;

    return token

}

module.exports = mongoose.model('user',userSchema)

