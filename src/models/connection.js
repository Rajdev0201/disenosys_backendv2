const mongoose = require('mongoose');


const connectionSchema = new mongoose.Schema({
  fromuserId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"userAuth",
    required: true
  },
  touserId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"userAuth",
    required: true
  },
  status:{
    type: String, 
    required:true,
    enum: {
        values: ["ignored", "intrested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
    }
  },

},{timestamps:true});


connectionSchema.index({fromuserId:1 , touserId:1});
module.exports = mongoose.model('connection',connectionSchema)