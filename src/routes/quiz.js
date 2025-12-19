const express = require('express');
const Question = require('../models/quiz.js');
const catia = require('../models/catia.js');
const product = require('../models/product.js');
const QuestionBIW = require('../models/biw.js');
const Code = require('../models/code.js');
const router = express.Router();




router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const questions = await QuestionBIW.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/questions-all', async (req, res) => {
  const { code } = req.query; 

  try {
    const foundCode = await Code.findOne({ code });

    if (!foundCode) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    if (!foundCode.isActive) {
      return res.status(400).json({ error: 'The code is inactive.' });
    }

    const examName = foundCode.cname;

    const questions = await QuestionBIW.find({ examname: examName });

    if (questions.length === 0) {
      return res.status(404).json({
        message: `No questions found for the exam "${examName}".`,
      });
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});



router.get('/examnames', async (req, res) => {
  try {
    const examNames = await QuestionBIW.distinct('examname');
    res.json(examNames);
  } catch (err) {
    console.error('Error fetching exam names:', err);
    res.status(500).send('Server Error');
  }
});



router.get('/catia', async (req, res) => {
  try {
    const questions = await catia.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/product', async (req, res) => {
  try {
    const questions = await product.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});



router.post('/add', async (req, res) => {
  const { question, options } = req.body;

  try {
    const newQuestion = new Question({ question, options });
    await newQuestion.save();
    res.json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add question' });
  }
});

module.exports = router;
