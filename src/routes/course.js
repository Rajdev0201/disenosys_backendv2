const express = require("express")
const {
  createCourse,
  getAllCourses,
  getByCategories,
  getCourseById,
  updateCourse,
  Reviews,
  deleteCourse,
} = require("../controllers/course");

const router = express.Router();

// router.route("/course/createCourse").post(createCourse)
// router.route("/getAllCourses").get(getAllCourses)
// router.route("/getCourseBycategory").get(getByCategories)
// router.route("/postreviews").post(Reviews)

router.get("/getAllCourses",getAllCourses)
router.get("/getCourseBycategory", getByCategories);

// Course create/update endpoints (frontend admin)
router.post("/course", createCourse);
router.post("/course/createCourse", createCourse); // backward-compatible
router.get("/course/:id", getCourseById);
router.delete("/course/:id",deleteCourse);
router.put("/course/:id", updateCourse);
router.patch("/course/:id", updateCourse);
router.put("/course/updateCourse/:id", updateCourse); // backward-compatible
router.patch("/course/updateCourse/:id", updateCourse); // backward-compatible

router.post("/course/reviews", Reviews);
module.exports = router;
