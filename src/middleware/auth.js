const jwt = require("jsonwebtoken");
const User = require("../models/userAuth");

const userAuth = async (req,res,next) => {

    try{
      const { token } = req.cookies;

   if(!token){
    return res.status(401).json({autherr:"You are not logged in"})
   }

   const decodeObj = await jwt.verify(token, "Dis12");

   const {_id} = decodeObj;

   const user = await User.findById(_id);

   if(!user){
    return res.status(401).json({message:"User not found"})
   }

  req.user = user;
  next();
}catch(err){
    console.log(err);
}

}  

module.exports = userAuth;

