const connection = require("../models/connection");
const userAuth = require("../models/userAuth");



const DATA = "firstName lastName email phoneNumber about bio age skills"; 


//request connection
exports.requestConnection = async (req,res) => {
  try{
    const fromuserId = req.user._id;
    const touserId = req.params.toUserId;
    const status = req.params.status;
   
    const checkStatus = ["ignored","intrested"]; // create a status 

    if(!checkStatus.includes(status)){
        return res.status(400).json({message: "Invalid status type"}); //check if status is valid
    }
    if(fromuserId === touserId){
        return res.status(400).json({message: "You cannot send a request to yourself"});
    }

    const toUser = await userAuth.findById(touserId);

    if(!toUser){
        return res.status(404).json({message: "User not found"});
    }
    const existingConnection = await connection.findOne({ //existing connection check 
        $or: [
            { fromuserId, touserId },
            {fromuserId:touserId, touserId:fromuserId}
        ]
    })

     if(existingConnection){
       return res.status(400).json({message: "Connection request already exists"});
     }

    const createConnection = new connection({
        fromuserId,
        touserId,
        status
    })

    await createConnection.save();
    return res.status(200).json({message: req.user.firstName + " " + "sent request to" + " " + toUser.firstName , createConnection});

  }catch(err){
    console.log(err);
    return res.status(500).json({message: "Internal Server Error" + err.message});
  }
}

//receive connection requests 
exports.recieveRequests = async(req,res) => {
    try{
        const loggedUser = req.user._id;
        console.log(loggedUser);

        if(!loggedUser){
            return res.status(400).json({message: "User not found"});
        }

        const requests = await connection.find({
            touserId:loggedUser,
            status:"intrested",
        }).populate("fromuserId",DATA)

        if(!requests){
            return res.status(404).json({message: "No connection requests found"});
        }

        return res.status(200).json({message: "Connection requests received for", requests});

      }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error" + err.message});
    }
}


//review connection request => accepted or rejected
exports.reviewConnection = async (req,res) => {
    try{
        const loggedUser = req.user;
        const request = req.params.requestId; //get request user id 
        const status = req.params.status;
        
        const checkStatus = ["accepted","rejected"]; // create a status

        if(!checkStatus.includes(status)){
            return res.status(400).json({message: "Invalid status type"}); //check if status is valid
        }

        const connectionRequest = await connection.findOne({
            _id:request,  // request user id 
            touserId: loggedUser._id, //logged in user id
            status:"accepted"
        })

        if(!connectionRequest){
            return res.status(404).json({message: "Connection request not found or already reviewed"});
        }
        connectionRequest.status = status; 
        await connectionRequest.save();
        return res.status(200).json({message: "Connection request " + status, connectionRequest});
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error" + err.message});
    }
}

//get all connections
exports.getAllConnections = async (req,res) => {
    try{
        const loggedUser = req.user._id;
        if(!loggedUser){
            return res.status(400).json({message:"user not found"});
        }
        const connections = await connection.find({
            $or:[
                {fromuserId: loggedUser,status:"accepted"}, //me given request to someone and get data
                {touserId: loggedUser,status:"accepted"} //someone given request to me and get data
            ]
        }).populate("fromuserId",DATA).populate("touserId",DATA);
         
        if(!connections){
            return res.status(404).json({message: "No connections found"});
        }

        const data = connections.map((data) => {
         if(data.fromuserId._id.toString() === loggedUser.toString()){ // check logged user id match from user given only connection user
            return data.touserId
         }
          return data.fromuserId;
        })
        return res.status(200).json({message: "All connections", data});

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error" + err.message});
    }
}


//feed

exports.getFeed = async(req,res) => {
    try{
        const loggedUser = req.user._id;
        if(!loggedUser){
            return res.status(400).json({message:"user not found"});
        }

        const hideConnections = await connection.find({
            $or:[
                {fromuserId: loggedUser}, {touserId: loggedUser}
            ]
        })
        
     const hideUser = new Set();

     hideConnections.forEach((req) => {
      hideUser.add(req.fromuserId.toString());
      hideUser.add(req.touserId.toString());
    });
    const user = await userAuth.find({
        $and:[
            {_id:{$nin:Array.from(hideUser)}},//already a connection dont show
            {_id:{$ne:loggedUser}} //logged in user dont show
        ]
    })

    res.status(200).json({message:"Feed data",user})
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error" + err.message});
    }
}

