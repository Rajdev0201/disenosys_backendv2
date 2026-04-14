const express = require("express");
const {
  adminRegister,
  adminLogin,
  adminLogout,
  adminProfileData,
} = require("../controllers/adminAuth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);
router.get("/admin/logout", adminLogout);

router.get("/admin/me", adminAuth,adminProfileData );

module.exports = router;

