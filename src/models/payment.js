const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
  sessionId: String,
  lineItems: Array,
  user: {
      type: mongoose.Schema.Types.ObjectId,
       ref: "user",
       required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  isActive: { type: Boolean, default: false },
}, { timestamps: true });

checkoutSchema.index({user:1});
module.exports = mongoose.model("CheckoutSession", checkoutSchema);
