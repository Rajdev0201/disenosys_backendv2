require("dotenv").config();
const express = require('express')
const app = express();
const cors = require('cors');
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
    origin:["http://localhost:3000","https://www.disenosys.com"],
    methods:['GET', 'POST', 'PUT', 'DELETE'],
    credentials:true
}));

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

//local port address
app.listen(8000, () => {
 console.log('Started server...');
})

