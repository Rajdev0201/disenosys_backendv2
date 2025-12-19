const express = require('express');
const userAuth = require('../middleware/auth');
const { requestConnection, reviewConnection, recieveRequests, getAllConnections, getFeed } = require('../controllers/connection');
const router = express.Router();


router.post("/send-request/:status/:toUserId",userAuth,requestConnection);

router.post("/review-request/:status/:requestId",userAuth,reviewConnection);

router.get("/requested-connections",userAuth,recieveRequests);

router.get("/connections",userAuth,getAllConnections);

router.get("/feed",userAuth,getFeed);
module.exports = router;