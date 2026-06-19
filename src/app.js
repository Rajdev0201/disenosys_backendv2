require("dotenv").config();
const express = require('express')
const app = express();
const cors = require('cors');
const multer = require("multer");
const nodemailer = require("nodemailer");
const XLSX = require('xlsx');
const connectMongoDb = require("./configure/connectMongoDb");
const cookieParser = require('cookie-parser');
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connection");
const bookNowRoutes = require("./routes/booknow");
const course = require("./routes/course");
const questionRoutes = require("./routes/quiz");
const launchExam = require("./routes/lanuchResult");
const enroll =  require("./routes/enroll");
const contact = require("./routes/contact");
const gpdx = require("./routes/gpdx");
const policyBot = require("./routes/policyBot");
const blog = require("./routes/blog");
const addtoCart = require("./routes/addtocart");
const payment = require("./routes/payment");
const tracking = require("./routes/courseTrack");
const adminRoutes = require("./routes/adminRoutes");
const Question = require("./models/quiz");
const gpdxResult = require("./routes/students");
const Code = require("./routes/code");

const dns = require('dns');
 dns.setServers(['8.8.8.8','1.1.1.1'])
// const dotenv = require("dotenv")
// const path = require("path")

// dotenv.config({ path: path.join(__dirname, "../.env") })


//connect db
connectMongoDb();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//accessing another domain req and send res
app.use(cors({
    origin:["http://localhost:3000","https://www.disenosys.com","http://localhost:3001","https://disenosys-admin.vercel.app","https://disenosys-eight.vercel.app"],
    methods:['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials:true
}));

app.post("/course/razorpay-webhook",express.raw({ type: "application/json" }),
  require("./controllers/payment").razorpayWebhookHandler
);

app.use('/',userRoutes);
app.use('/',connectionRoutes);
app.use('/',bookNowRoutes);
app.use('/',course);
app.use('', questionRoutes);
app.use('/',launchExam);
app.use("/",enroll);
app.use("/",contact);
app.use("/",gpdx);
app.use("/",policyBot);
app.use("/",blog);
app.use("/",addtoCart);
app.use("/",payment);
app.use("/",tracking);
app.use("/",adminRoutes);
app.use("/",gpdxResult);
app.use("/",Code);

const upload = multer({ dest: 'uploadsquiz/' });
const formDataParser = multer();
//upload gpdx 
app.post('/quiz', upload.none(), async (req, res) => {
  try {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      for (const row of sheetData) {
          console.log("Processing row:", row);

          const normalizedRow = Object.fromEntries(
              Object.entries(row).map(([key, value]) => [key.trim(), String(value).trim()])
          );

          const options = [
              { text: normalizedRow['Option1'] || '', isCorrect: normalizedRow['Option1_isCorrect'].toUpperCase() === 'TRUE' },
              { text: normalizedRow['Option2'] || '', isCorrect: normalizedRow['Option2_isCorrect'].toUpperCase() === 'TRUE' },
              { text: normalizedRow['Option3'] || '', isCorrect: normalizedRow['Option3_isCorrect'].toUpperCase() === 'TRUE' },
              { text: normalizedRow['Option4'] || '', isCorrect: normalizedRow['Option4_isCorrect'].toUpperCase() === 'TRUE' }
          ];

          // Check if the question and options are valid
          if (normalizedRow['Question'] && options.every(option => option.text)) {
              const question = new Question({
                  question: normalizedRow['Question'],
                  options
              });

              // console.log("Question object to save:", JSON.stringify(question, null, 2));

              try {
                  const savedQuestion = await question.save();
                  console.log(`Saved question: ${savedQuestion.question}`);
              } catch (saveError) {
                  console.error(`Error saving question: ${saveError.message}`, saveError);
              }
          } else {
              console.warn(`Skipping question due to missing fields: ${JSON.stringify(normalizedRow)}`);
          }
      }

      res.status(200).json({ message: 'Questions uploaded and saved successfully!' });
  } catch (err) {
      console.error('Error details:', err);
      res.status(500).json({ error: 'Failed to upload questions', details: err });
  }
});

//course certificate 
app.post("/send-single-certificate-course", formDataParser.none(), async (req, res) => {
  try {
    const { email, pdfDataUrl, name, course } = req.body || {};
    if (!email || !pdfDataUrl) {
      return res.status(400).send("Missing email or PDF data");
    }
  
    const base64Data = pdfDataUrl.split(";base64,").pop();
    const pdfBuffer = Buffer.from(base64Data, "base64");

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
      from: "classes@disenosys.com",
      to: email,
      subject: `Certificate of Completion for ${course}`,
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333333;
                background-color: #f4f4f9;
                margin: 0;
                padding: 0;
              }
              .email-container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                margin: 20px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #004aad;
                font-size: 24px;
                margin-bottom: 10px;
              }
              p {
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
              }
              .footer {
                margin-top: 20px;
                font-size: 14px;
                text-align: start;
                color: #888888;
              }
              .highlight {
                color: #004aad;
                font-weight: bold;
              }
              .cta {
                color: #ffffff;
                background-color: #004aad;
                padding: 10px 15px;
                text-decoration: none;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h1>Certificate of Completion</h1>
              <p>Dear <span class="highlight">${name}</span>,</p>
              <p>We are pleased to inform you that you have successfully completed the <span class="highlight">${course}</span>. Please find attached your Certificate of Completion for the course.</p>
              <p>We congratulate you on your achievement and wish you continued success in your future endeavors.</p>
              <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
              
              <p class="footer">Best regards, <br />The Disenosys Team</p>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `${name}_Certificate_of_Completion.pdf`,
          content: pdfBuffer,
        },
      ],
    };
    

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send("Error sending email");
      }
      res.send("Certificate sent successfully");
    });
} catch (error) {
    res.status(500).send("Error processing the certificate request");
  }
});

//local port address
app.listen(8000, () => {
 console.log('Started server...');
})

