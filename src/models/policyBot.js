const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  docType: { type: String, required: true },
  chunk: { type: String, required: true },
  embedding: { type: [Number], required: true }, // vector array
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PolicyVector", PolicySchema);
