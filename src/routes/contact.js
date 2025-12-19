const express = require("express");
const { contactPost } = require("../controllers/contact");
const router = express.Router();



router.post("/contact",contactPost);


module.exports = router;