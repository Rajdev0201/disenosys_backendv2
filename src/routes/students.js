const express = require('express');
const router = express.Router();
const Code = require('../models/code.js');
const Student = require('../models/students.js');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const QuestionBIW = require('../models/biw.js');
const { format,isValid } = require('date-fns');

router.post('/student-login', async (req, res) => {
    const { name, email, code,mobile } = req.body;
    console.log('Login request received with data:', { name, email, code, mobile });
    
    try {
        const foundCode = await Code.findOne({ code });
        if (!foundCode) {
            return res.status(400).json({ error: 'Invalid code' });
        }
        
    if (!foundCode.isActive) {
      return res.status(400).json({ error: 'The code is inactive.' });
    }
        if (foundCode.userType === 'external') {
            const currentDate = new Date();
            if (foundCode.expiresAt && foundCode.expiresAt <= currentDate) {
                return res.status(400).json({ error: 'The code has expired.' });
            }
        }

        let existingStudent = await Student.findOne({ email });

        if (existingStudent) {


            if (existingStudent.attendedQuiz === true) {
                return res.status(400).json({ error: 'You have already attended the quiz.' });
            }

            return res.json({
                message: 'Welcome back! You can attend the quiz.',
                user: existingStudent,
            });
        }

        const student = new Student({
            name,
            email,
            college: foundCode.college,
            userType: foundCode.userType,
            codeUsed: code,
            mobile
        });

        const savedStudent = await student.save();

        res.json({ 
            message: 'Login successful, you can attend the quiz.', 
            user: savedStudent 
        });

    } catch (error) {
        res.status(400).json({ error: 'Login failed' });
        console.log(error);
    }
});


router.post('/examAll-login', async (req, res) => {
  const { name, email, code, mobile } = req.body;

  try {
    const foundCode = await Code.findOne({ code });

    if (!foundCode) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    if (!foundCode.isActive) {
      return res.status(400).json({ error: 'The code is inactive.' });
    }

    if (foundCode.userType === 'companycode') {
      const currentDate = new Date();
      if (foundCode.expiresAt && foundCode.expiresAt <= currentDate) {
        return res.status(400).json({ error: 'The code has expired.' });
      }
    }
    const examNames = await QuestionBIW.distinct('examname');
    if (!examNames.includes(foundCode.cname)) {
      return res.status(400).json({
        error: `Invalid code. This code is for the "${foundCode.cname}" exam, not the selected exam.`,
      });
    }

    let existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      if (existingStudent.attendedQuiz === true) {
        return res.status(400).json({ error: 'You have already attended the quiz.' });
      }

      return res.json({
        message: 'Welcome back! You can attend the quiz.',
        user: existingStudent,
      });
    }
    const student = new Student({
      name,
      email,
      college: foundCode.college,
      userType: foundCode.userType,
      codeUsed: code,
      courseName: foundCode.cname,
      mobile,
    });

    const savedStudent = await student.save();

    res.json({
      message: 'Login successful, you can attend the quiz.',
      user: savedStudent,
    });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
    console.log(error);
  }
});


const sendResultEmail = async (studentEmail, studentName, totalScore, percentage) => {
  const transporter = nodemailer.createTransport({

    host: 'smtp.office365.com', 
   port: 587,                 
   secure: false,   
   auth: {
    user: 'classes@disenosys.com',
    pass: 'xnccsypkfhfpymwg',
  }
   });

   const mailOptions = {
    from: 'classes@disenosys.com',
    to: studentEmail,
    subject: 'Your Quiz Results From Disenosys',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <!-- Header -->
        <div style="background-color: #182073; padding: 20px; text-align: center; color: #fff;">
          <img src="https://www.disenosys.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.d25c986e.png&w=384&q=75" alt="Disenosys Logo" style="max-width: 150px; margin-bottom: 10px;">
          <h1 style="font-size: 24px; margin: 0;">Quiz Results</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto; box-shadow: 0px 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Dear ${studentName},</h2>
          <p style="font-size: 16px; color: #666;">We are excited to share your quiz results with you. Here’s a summary:</p>
          
          <!-- Results Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9;">
            <thead>
              <tr style="background-color: #182073; color: #fff;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Total Score</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${totalScore}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${percentage}%</td>
              </tr>
            </tbody>
          </table>

          <p style="font-size: 16px; color: #666;">We appreciate your efforts and encourage you to keep up the great work! Feel free to reach out for any assistance.</p>
          
          <p style="font-size: 16px; color: #333;">Best regards,</p>
          <p style="font-size: 16px; color: #0d6efd; font-weight: bold;">The Disenosys Team</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Disenosys. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  
    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  

  
router.post('/updateStudentQuiz', async (req, res) => {
    const { studentId, totalScore, percentage } = req.body;
  
    try {
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
    //   student.quizResults = quizResults;
      student.totalScore = totalScore;
      student.percentage = percentage;
      student.attendedQuiz = true;
      // student.reason = reason;
      // student.status = status;
      student. quizFinishTime = Date.now();
  
      await student.save();
      await sendResultEmail(student.email, student.name, totalScore, percentage);
  
      res.status(200).json({ message: "Quiz results updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
});
  
router.post('/terminate', async (req, res) => {
    const { _id,reason,status } = req.body;
    try {
      const student = await Student.findById(_id);
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
    // student.quizResults = quizResults;
    //  student.totalScore = totalScore;
    //   student.percentage = percentage;
       student.reason = reason;
       student.status = status;
       student.attendedQuiz = true;
  
      await student.save();
 
      res.status(200).json({ message: "Quiz results updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
});
  


router.get('/result', async (req, res) => {
  try {
    const result = await Student.find();

    if (!result || result.length === 0) {
      console.log('No data available for download');
      return res.status(400).json({ error: 'No Data is available' });
    }

    const workbook = XLSX.utils.book_new();
    const worksheetData = result.map((student) => {

      const createdAtFormatted = isValid(new Date(student.createdAt))
        ? format(new Date(student.createdAt), 'dd/MM/yyyy, hh:mm a')
        : 'Invalid Date'; 

      const quizFinishTimeFormatted = isValid(new Date(student.quizFinishTime))
        ? format(new Date(student.quizFinishTime), 'dd/MM/yyyy, hh:mm a')
        : 'Invalid Date';
      return {
        name: student.name,
        email: student.email,
        college: student.college || 'N/A', 
        mobile: student.mobile,
        userType: student.userType,
        codeUsed: student.codeUsed,
        attendedQuiz: student.attendedQuiz,
        createdAt: createdAtFormatted,
        percentage: student.percentage,
        quizFinishTime: quizFinishTimeFormatted,
        totalScore: student.totalScore,
      };
    });


    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

   
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    
    res.setHeader('Content-Disposition', 'attachment; filename="results.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');


    res.send(excelBuffer);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to generate Excel file" });
  }
});



router.get('/demo', (req, res) => {
  try {
    const dummyData = [
      {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        course: 'Catia v5',
        // udin: 'UD123456',
        date: '01/01/2025',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@gmail.com',
        course: 'Advanced Catia',
        // udin: 'UD654321',
        date: '02/01/2025',
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dummyData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    const dummyBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(dummyBuffer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

router.get('/demo-intern', (req, res) => {
  try {
    const dummyData = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        course: 'Catia v5',
        from: '01/01/2025',
        to: '02/02/2025',
        awardedDate:"05/02/2025",
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dummyData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    const dummyBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(dummyBuffer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

router.get('/demo-examc', (req, res) => {
  try {
    const dummyData = [
      {
        name: 'John Doe',
        email: 'rajkumarprjpm@gmail.com',
        course: 'Catia v5',
        Score: '45',
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dummyData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    const dummyBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(dummyBuffer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});


router.get('/demo-gpdx', (req, res) => {
  try {
    const dummyData = [
      {
        name: 'John Doe',
        email: 'rajkumarprjpm@gmail.com',
        score: '90',
        awardedDate: '01-02-2025',
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dummyData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    const dummyBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(dummyBuffer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

router.get('/demo-exam', (req, res) => {
  try {
  
    const dummyData = [
      {
        Question: "Which Plastic Molding Process is used to manufacture Plastic Pipes?",
        Option1: "Injection Molding",
        Option1_isCorrect: false,
        Option2: "Blow Molding",
        Option2_isCorrect: true,
        Option3: "Compression Molding",
        Option3_isCorrect: false,
        Option4: "Rotational Molding",
        Option4_isCorrect: false,
      },
      {
        Question: "What is the primary material used in BIW manufacturing?",
        Option1: "Aluminum",
        Option1_isCorrect: false,
        Option2: "Steel",
        Option2_isCorrect: true,
        Option3: "Plastic",
        Option3_isCorrect: false,
        Option4: "Carbon Fiber",
        Option4_isCorrect: false,
      },
    ];
    

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dummyData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    const dummyBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(dummyBuffer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});
module.exports = router;



