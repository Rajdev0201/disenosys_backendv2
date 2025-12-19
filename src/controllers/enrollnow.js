const enrollnow = require("../models/enrollnow");

exports.postEnrollNow = async (req, res) => {
  const { name, email, phone,course } = req.body;
  try {
    if (!name || !email || !phone || !course) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const enroll = new enrollnow({
      name,
      email,
      phone,
      course
    });
    await enroll.save();
    return res.status(200).json({ message: "Post successfully", enroll });
  } catch (err) {
    return res.status(500).json({ message: "Post data gets error", err });
  }
};

exports.getEnrollNow = async (req, res) => {
  try {
    const getData = await enrollnow.find();

    if (!getData) {
      return res.status(400).json({ message: "failed fetch data" });
    }

    return res
      .status(200)
      .json({ message: "fetch data from booknow model", getData });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "internal server problem from fetch book data", err });
  }
};
