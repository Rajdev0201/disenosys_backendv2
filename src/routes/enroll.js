const express = require("express");
const { enrollPost } = require("../controllers/enroll");
const userAuth = require("../middleware/auth");
const router = express.Router();



router.post("/enrollPost",userAuth,enrollPost);


module.exports = router;