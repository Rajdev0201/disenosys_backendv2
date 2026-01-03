const express = require("express");
const Blog = require("../models/blog");
const router = express.Router();

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
    cloud_name: 'dapilmiei',
    api_key: '247445749891881',
    api_secret: 'aGTYn8CLmtagTL45f2SKdjiX3A8',
  });
  

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_images', // Cloudinary folder
    format: async (req, file) => 'png', // Format to save the file
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // File name
  },
});

const uploadBlog = multer({ storage });

router.post('/blog', uploadBlog.single('file'), async (req, res) => {
  const { name, designation, title, description } = req.body;

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log('Uploaded file details:', req.file);

  try {
    const newBlog = new Blog({
      filePath: req.file.path, 
      name,
      designation,
      title,
      description,
    });

    await newBlog.save();

    return res.status(201).json({
      message: 'Blog uploaded successfully',
      filePath: req.file.path,
    });
  } catch (error) {
    console.error('Error saving blog:', error);
    return res.status(500).send('Internal server error');
  }
});


router.get('/data', async (req, res) => {

    try{
        const data = await Blog.find();
    
        if(!data){
              return res.status(400).json({ error: 'No Data is available' });
        }
    
        res.status(200).json({
            message: 'blog data get',
            data: data,
          });
        }catch(err){
            console.log(err);
            return res.status(500).json({err : "data is not fetched"})
        }
 
})



module.exports = router;
