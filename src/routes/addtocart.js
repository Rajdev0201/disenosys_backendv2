
const express = require("express");
const { postCart, getCart, increament, decreament, removeCart } = require("../controllers/addtocart");

const router = express.Router();

router.post("/addCart",postCart);
router.get("/getCart", getCart);
router.put("/cart/:id/increament", increament);
router.put("/cart/:id/decreament", decreament);
router.delete("/cart/:id", removeCart);
module.exports = router;
