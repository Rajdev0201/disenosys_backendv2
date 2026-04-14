const Razorpay = require("razorpay");
const crypto = require("crypto");
const CheckoutSession = require("../models/payment");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");
const offlinePayment = require("../models/offlinePayment");
const course = require("../models/course")

const INR_SYMBOL = "Rs.";

const buildActivationEmail = ({ name, rows, sessionId }) => {
  const itemRows = rows
    .map(
      (item) =>
        `<tr><td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${item.name}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${INR_SYMBOL}${item.price}</td></tr>`,
    )
    .join("");

  const plainText = [
    `Dear ${name},`,
    "",
    "We are pleased to inform you that your course has been activated by our admin team.",
    "Visit your course: https://www.disenosys.com/mycourse",
    sessionId ? `Session ID: ${sessionId}` : null,
    "Status: Active",
    "",
    "Course details:",
    ...rows.map((item) => `- ${item.name}: ${INR_SYMBOL}${item.price}`),
    "",
    "Thank you for choosing Disenosys.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    plainText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <div style="background-color: #182073; padding: 20px; text-align: center; color: #fff;">
          <img src="https://www.disenosys.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.d25c986e.png&w=384&q=75" alt="Disenosys Logo" style="max-width: 150px; margin-bottom: 10px;">
          <h1 style="font-size: 24px; margin: 0;">Course Activation Notice</h1>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto; box-shadow: 0px 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Dear ${name},</h2>
          <p style="font-size: 16px; color: #666;">We are pleased to inform you that your course has been <strong>activated</strong> by our admin team.</p>
          <p style="font-size: 16px; color: #666;">
            Here you can find your course:
            <strong><a href="https://www.disenosys.com/mycourse" style="color: #0d6efd; text-decoration: none;">Visit Course</a></strong>
          </p>
          <div style="background-color: #f9f9f9; padding: 10px 20px; border-left: 4px solid #182073; margin: 20px 0; border-radius: 4px;">
            ${sessionId ? `<p style="font-size: 16px; margin: 0;"><strong>Session ID:</strong> ${sessionId}</p>` : ""}
            <p style="font-size: 16px; margin: 0;"><strong>Status:</strong> Active</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9;">
            <thead>
              <tr style="background-color: #182073; color: #fff;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Course Name</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
          <p style="font-size: 16px; color: #666;">Thank you for choosing us for your learning journey. We look forward to providing you with a valuable experience.</p>
          <p style="font-size: 16px; color: #333;">Best regards,</p>
          <p style="font-size: 16px; color: #0d6efd; font-weight: bold;">The Admin Team</p>
        </div>
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Disenosys. All rights reserved.</p>
        </div>
      </div>
    `,
  };
};

exports.createCheckoutSession = async (req, res) => {
  const { cartItems, amount } = req.body;
  const user = req.user?._id;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Cart items required" });
  }

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: "Valid amount required" });
  }

  if (!user) {
    return res.status(400).json({ message: "User not verified" });
  }

  const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const session = new CheckoutSession({
      sessionId: order.id,
      lineItems: cartItems,
      user: user,
    });

    await session.save();

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    res.status(500).json({ message: "Order creation failed" });
  }
};

exports.razorpayWebhookHandler = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = JSON.parse(req.body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;

    const orderData = await CheckoutSession.findOne({
      sessionId: orderId,
      isPaid: false,
    });

    if (!orderData) return res.status(404).json({ message: "Order not found" });

    orderData.isPaid = true;
    await orderData.save();

    await sendPayment(
      orderData.customerDetails.email,
      orderData.customerDetails.name,
      orderData.lineItems,
    );

    console.log("Payment verified via webhook");
  }

  res.status(200).json({ status: "ok" });
};

const sendPayment = async (email, name, items) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemRows = items
    .map((item) => `<tr><td>${item.name}</td><td>${INR_SYMBOL}${item.totalPrice}</td></tr>`)
    .join("");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Payment Successful - Disenosys",
    html: `
      <h2>Hello ${name}</h2>
      <p>Your payment was successful.</p>
      <table border="1">${itemRows}</table>
    `,
  });
};

//get paid students list to show in admin dashboard
exports.getPlaceOrder = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    const DataList = await CheckoutSession.find(
      search ? searchQuery : { isPaid: true },
    )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!DataList || DataList.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    const total = await CheckoutSession.countDocuments(
      search ? searchQuery : { isPaid: true },
    );
    res.status(200).json({
      message: "The data is fetched successfully",
      DataList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ err: "There was an issue fetching the data" });
  }
};

//add offline payment by admin
exports.addOfflinePayment = async (req, res) => {
  try {
    const { name, email, courseName, fees } = req.body;

    if (!name || !email || !courseName || !fees) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPayment = new offlinePayment({
      name,
      email,
      courseName,
      fees,
      isPaid: true,
    });
    const savedPayment = await newPayment.save();
    res.status(201).json({
      message: "Offline payment added successfully",
      data: savedPayment,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding offline payment", error: err.message });
  }
};

//get offline payment list to show in admin dashboard
exports.getOfflinePayments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    const DataList = await offlinePayment
      .find(search ? searchQuery : { isPaid: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!DataList || DataList.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    const total = await offlinePayment.countDocuments(
      search ? searchQuery : { isPaid: true },
    );
    res.status(200).json({
      message: "The data is fetched successfully",
      DataList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ err: "There was an issue fetching the data" });
  }
};

//active deactive offline payment by admin
exports.onlineActive = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const updatedCode = await CheckoutSession.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true },
    );

    if (!updatedCode) {
      return res.status(400).json({ error: "Valid payment!" });
    }

    if (isActive) {
      const activationEmail = buildActivationEmail({
        name: updatedCode.customerDetails.name,
        sessionId: updatedCode.sessionId,
        rows: (updatedCode.lineItems || []).map((item) => ({
          name: item.name,
          price: item.totalPrice,
        })),
      });

      const mailOptions = {
        to: updatedCode.customerDetails.email,
        subject: "Your Course Has Been Activated!",
        html: activationEmail.html,
        plainText: activationEmail.plainText,
      };

      await sendEmail(mailOptions);
      res.status(200).json({
        success: true,
        data: updatedCode,
        message: "You get the Active token",
      });
    } else {
      res.status(200).json({
        success: true,
        data: updatedCode,
        message: "You get the DeActive token",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
//active deactive offline payment by admin
exports.offlineActive = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const updatedCode = await offlinePayment.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true },
    );

    if (!updatedCode) {
      return res.status(400).json({ error: "Valid payment!" });
    }

    if (isActive) {
      const activationEmail = buildActivationEmail({
        name: updatedCode.name,
        rows: [
          {
            name: updatedCode.courseName,
            price: updatedCode.fees,
          },
        ],
      });

      const mailOptions = {
        to: updatedCode.email,
        subject: "Your Course Has Been Activated!",
        html: activationEmail.html,
        plainText: activationEmail.plainText,
      };

      await sendEmail(mailOptions);
      res.status(200).json({
        success: true,
        data: updatedCode,
        message: "You get the Active token",
      });
    } else {
      res.status(200).json({
        success: true,
        data: updatedCode,
        message: "You get the DeActive token",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
//Show online paid course in user dashboard
exports.userPaidCourse = async (req, res) => {
  const user = req.user?._id;
  try {
    if (!user) {
      return res.status(400).json({ message: "User not verified" });
    }
    const paidCourse = await CheckoutSession.find({
      user: user,
      isPaid: true,
      isActive:true,
    }).select("lineItems -_id");
    if (!paidCourse || paidCourse.length === 0) {
      return res.status(404).json({ message: "No paid courses found" });
    }
    res
      .status(200)
      .json({ message: "Paid courses fetched successfully", paidCourse });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching paid courses", error: err.message });
  }
};


//show offline paid course in user dashboard
exports.userOfflinePaidCourse = async (req, res) => {
      const userEmail = req.user?.userEmail;
  try{
    if (!userEmail) {
      return res.status(400).json({ message: "User not verified" });
    }
    const paidCourse = await offlinePayment.find({
      email: userEmail,
      isPaid: true,
      isActive:true,
    }).select("courseName fees -_id");
    
    if (!paidCourse || paidCourse.length === 0) {
      return res.status(404).json({ message: "No offline paid courses found" });
    }
    const getCourseNames = paidCourse.map((course) => course.courseName);
    const getCourseData = await course.find({ courseName: { $in: getCourseNames } }).select("courseName imagePath description _id");
    res.status(200).json({ message: "Offline paid courses fetched successfully", getCourseData });
  } catch (err) {
    res.status(500).json({ message: "Error fetching offline paid courses", error: err.message });
  }
}

//record course fetch
exports.recordCourseFetch = async (req, res) => {
   const userEmail = req.user?.userEmail;
   const courseName = req.query.courseName;
  try{
    if (!userEmail) {
      return res.status(400).json({ message: "User not verified" });
    }
    const paidCourse = await course.find({
      courseName : courseName
    })
    if(!paidCourse || paidCourse.length === 0){
      return res.status(404).json({ message: "No course found" });
    }
    res.status(200).json({ message: "Course fetched successfully", paidCourse });
  }catch(err){
    res.status(500).json({ message: "Error fetching offline paid courses", error: err.message });
  }
}
