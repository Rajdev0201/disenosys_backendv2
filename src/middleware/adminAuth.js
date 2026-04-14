const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const adminAuth = async (req, res, next) => {
  try {
    const { adminToken } = req.cookies || {};

    if (!adminToken) {
      return res.status(401).json({ autherr: "You are not logged in" });
    }

    const decodeObj = await jwt.verify(adminToken, "Dis12");
    const { _id } = decodeObj;

    const admin = await Admin.findById(_id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = adminAuth;

