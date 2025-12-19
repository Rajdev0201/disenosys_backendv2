const mongoose = require('mongoose');

const sharedScoreSchema = new mongoose.Schema({
    userUrn: { type: String},
    name: { type: String }, 
    email: { type: String},  
    phone: {type : String},
    commentary: { type: String},
    yourScore: { type: Number},
    yourLevel: { type: String},
    sharedAt: { type: Date, default: Date.now },
  });
  
  const SharedScore = mongoose.model("SharedScore", sharedScoreSchema);
  module.exports = SharedScore;