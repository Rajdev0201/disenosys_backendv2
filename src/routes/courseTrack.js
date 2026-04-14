const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getCourseProgress, saveCourseProgress, patchCourseProgress } = require("../controllers/courseTrack");

router.post("/save-progress", auth, saveCourseProgress);
router.patch("/save-progress", auth, patchCourseProgress);
router.get("/course-completed", auth, getCourseProgress);

module.exports = router;
