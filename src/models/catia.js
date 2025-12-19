const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const catiaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [optionSchema], required: true } 
});



const catia = mongoose.model('catia', catiaSchema);

module.exports = catia;
