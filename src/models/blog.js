const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  name: { type: String },                     
  designation: { type: String},
  title: { type: String },
  description: { type: String},
  filePath: { type: String,required:true},
}, { timestamps: true }); 

const Blog = mongoose.model("blog", blogSchema);
module.exports = Blog;