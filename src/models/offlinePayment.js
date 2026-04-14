const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required:true
    },
    courseName:{
        type:String,
        required:true
    },
    fees:{
        type:Number,
        required:true
    },
     isPaid: {
     type: Boolean,
      default: false,
  },
   isActive: { type: Boolean, default: false },
},{timestamps:true});

module.exports = mongoose.model("offlinePayments",checkoutSchema);
