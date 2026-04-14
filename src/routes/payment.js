const express = require("express");
const { createCheckoutSession, getPlaceOrder, getOfflinePayments, offlineActive, addOfflinePayment, userPaidCourse, userOfflinePaidCourse, recordCourseFetch } = require("../controllers/payment");
const userAuth = require("../middleware/auth");
const router = express.Router();


router.post("/checkout-order",userAuth,createCheckoutSession );
router.get("/paymentDetails",getPlaceOrder);
router.post("/add-offline-payment",addOfflinePayment);
router.get("/offline-payments",getOfflinePayments);
router.patch("/offline-active/:id",offlineActive);

router.get("/online-paid-dashboard",userAuth,userPaidCourse);
router.get("/offline-paid-dashboard",userAuth,userOfflinePaidCourse);
router.get("/record-course",userAuth,recordCourseFetch);

module.exports = router;
