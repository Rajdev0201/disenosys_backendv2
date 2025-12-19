const express = require('express');
const { Register, login, logout, Glogin, getAuth, LinkedinLogin, getProfile, updateProfile, changePassword, deleteAccount,ResetLink,ResetPassword} = require('../controllers/userAuth');
const userAuth = require('../middleware/auth');
const { profileData } = require('../controllers/profile');

const router = express.Router();

//manual login
router.post('/register',Register);
router.post('/login',login);
router.get('/logout',logout);

//Google
router.post('/Glogin',Glogin);

//Linkedin
router.get('/auth',getAuth);
router.post('/get-access-token',LinkedinLogin);
router.post('/getInfo',getProfile);

//profile data
router.get('/profile',userAuth,profileData)


//update and delete and reset
router.put("/update-profile", userAuth, updateProfile);
router.put("/change-password", userAuth, changePassword);
router.delete("/delete-account", userAuth, deleteAccount);

router.post("/user/forgotPassword",ResetLink)
router.put("/user/changePassword/:token",ResetPassword)
module.exports = router;