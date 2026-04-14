const sendAdminToken = (admin, res, statusCode) => {
  const token = admin.getJwtToken();
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  res.status(statusCode).cookie("adminToken", token, options).json({
    success: true,
    message: "Admin token is sent",
    token,
    admin,
  });
};

module.exports = sendAdminToken;

