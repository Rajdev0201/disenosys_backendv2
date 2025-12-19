
const mongoose = require('mongoose');
const connectMongoDb = ()  => {

    const mongoUrl =process.env.MONGO_URL
    mongoose.connect(mongoUrl)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

}

module.exports = connectMongoDb;