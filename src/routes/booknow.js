const express = require("express");

const { postBookNow, getBookNow } = require("../controllers/booknow");
const router =  express.Router();

router.post("/booknowPost",postBookNow);
router.get("/booknowGet",getBookNow);


module.exports = router;