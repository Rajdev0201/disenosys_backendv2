
const course = require("../models/course")


// exports.createCourse = async(req,res,next)=>{

//     const {courseName,category,price,description,duration,noOfLessons} = req.body


//     const course = await course.create({
//         courseName: courseName,
//         category: category,
//         price: price,
//         duration: duration,
//         description: description,
//         noOfLessons: noOfLessons
//     })
//     if(!course)
//     {
//         return next(new ErrorHandler("Error in Creating Course",400))
//     }

//     res.status(200).json({
//         success: true,
//         course
//     })
// }

exports.getAllCourses = async(req,res)=>{
   const courses = await course.find();

    if(!courses)
    {
        return res.status(400).json({message:"error in getting course"})
    }
     const encoded = Buffer.from(JSON.stringify(courses)).toString("base64");

     return res.json({ success: true, data: encoded });
}

// exports.getByCategories = async(req,res)=>{

//     const {category} = req.query
//     const courses = await course.find({category: {
//         $in:[category]
//     }})

//     if(!courses)
//     {
//         return res.status(400).json({message:"error in getting course"})
//     }
// const length = courses.length
//     res.status(200).json({
//         success: true,
//         courses
//     })
// }

exports.Reviews =async (req, res) => {
    const { courseId, name, rating, message,like } = req.body;
    console.log(req.body)
    if (!courseId || !rating) {
      return res.status(400).json({ success: false, message: "Course ID and rating are required" });
    }
  
    const course = await course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
  
    const newReview = {
      name: name || "Anonymous",
      rating,
      like,
      message: message || "",
    };
    course.reviews.push(newReview);
    await course.save(); 
  
    res.status(200).json({ success: true, message: "Review added successfully", reviews: course.reviews });
};