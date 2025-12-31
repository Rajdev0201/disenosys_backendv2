

const sendToken = (user,res,statusCode) => {

    const token = user.getJwtToken();
    const options = {
        expires: new Date(Date.now() + 8 * 3600000),
         httpOnly: true,
         secure: true, // true in production (https)
         sameSite: "strict",
    }

    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        message: "Token is sent",
        token,
        user
    })
}

module.exports = sendToken;