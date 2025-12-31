

const sendToken = (user,res,statusCode) => {

    const token = user.getJwtToken();
    const options = {
  expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
  httpOnly: true,
  secure: true,          // REQUIRED for SameSite=None
  sameSite: "none",      // 🔴 REQUIRED
  path: "/",             // 🔴 VERY IMPORTANT
};


    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        message: "Token is sent",
        token,
        user
    })
}

module.exports = sendToken;