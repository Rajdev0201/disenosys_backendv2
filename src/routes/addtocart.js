
const express = require("express");
const { postCart, getCart, removeCart, increment, decrement } = require("../controllers/addtocart");
const userAuth = require("../middleware/auth");

const router = express.Router();

router.post("/addCart",userAuth,postCart);
router.get("/getCart",userAuth, getCart);
router.put("/cart/:id/increament",userAuth, increment);
router.put("/cart/:id/decreament",userAuth, decrement);
router.delete("/cart/:id",userAuth, removeCart);
module.exports = router;
