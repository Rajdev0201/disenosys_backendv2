

exports.profileData = async(req,res) => {
    try{
        const user = req.user;
         if(!user){
            return res.status(400).json({message:"user not found"})
         }
         res.status(200).json({message: "User profile data", user});
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error" + err.message});
    }
}