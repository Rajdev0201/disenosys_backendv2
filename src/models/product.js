const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const productSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [optionSchema], required: true } 
});



const product = mongoose.model('product', productSchema);

module.exports = product;
