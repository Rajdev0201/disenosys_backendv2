const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const questionBIWSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [optionSchema], required: true },
  examname: { type: String, required: true }, 
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


const QuestionBIW = mongoose.model('ExamQuestion', questionBIWSchema);

module.exports = QuestionBIW;
