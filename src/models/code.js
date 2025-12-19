const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    userType: { type: String, required: true },
    expiresAt: { type: Date, },
    createdAt: { type: Date, default: Date.now },
    college: { type: String },
    city:{ type: String },
    country:{type:String},
    cname:{type:String},
    isActive: { type: Boolean, default: true },
    // collegeCode: { type: String, unique: true },
});

const Code = mongoose.model('Code', codeSchema);
module.exports = Code;
