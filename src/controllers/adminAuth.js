const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const sendAdminToken = require("../utils/sendAdminToken");

exports.adminRegister = async (req, res) => {
  const { userName, userEmail, password, userType } = req.body || {};

  try {
    if (!userName || !userEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Admin.findOne({ userEmail });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      userName,
      userEmail,
      password: hashedPassword,
      userType: userType || "admin",
    });

    return sendAdminToken(admin, res, 201);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.adminLogin = async (req, res) => {
  const { userEmail, password } = req.body || {};
 try {
    if (!userEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Admin.findOne({ userEmail }).select("+password");
    if (!admin) {
      return res.status(400).json({ message: "Admin does not exist" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Your password is incorrect" });
    }

    admin.password = undefined;
    return sendAdminToken(admin, res, 200);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.adminLogout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("adminToken", null, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
        path: "/",
      })
      .json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.adminProfileData = async(req,res) => {
    try{
        const admin = req.admin;
        if(!admin){
            return res.status(400).json({message:"admin not found"})
        }
        res.status(200).json({message: "Admin profile data", admin});
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error" + err.message});
    }
}
