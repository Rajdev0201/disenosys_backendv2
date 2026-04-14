const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


const adminSchema = new mongoose.Schema({
    userName:{
        type: String,
        unique: true,
        required:[true,"Please Enter UserName"]
    },
    userEmail:{
        type: String,
        unique: true,
        required:[true,"Please Enter UserEmail"]
    },
    password:{
        type: String,
        required:[true,"Please Enter Password"],
        select: false
    },
    userType: { type: String, required: true, default: "admin" },
},{timestamps:true})


adminSchema.methods.isValidatePassword = function(enPassword){

    return  bcrypt.compare(enPassword,this.password);
  
}

adminSchema.methods.getJwtToken = function (){
    // Keep consistent with user auth (`src/models/userAuth.js` + `src/middleware/auth.js`)
    return jwt.sign({ _id: this._id }, "Dis12");
 
 }

 adminSchema.methods.getresetPasswordToken = function (){

    const token = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken =  crypto.createHash('sha256').update(token).digest('hex');

    this.resetPasswordTokenExpire = Date.now() + 20 * 60 * 1000;

    return token

}

module.exports = mongoose.model("admin",adminSchema);
