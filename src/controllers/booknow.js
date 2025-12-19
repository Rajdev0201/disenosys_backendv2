const booknow = require("../models/booknow");

exports.postBookNow = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newBooknow = new booknow({
      name,
      email,
      phone,
    });
    await newBooknow.save();
    return res.status(200).json({ message: "Post successfully", newBooknow });
  } catch(err) {
    return res.status(500).json({ message: "Post data gets error", err });
  }
};

exports.getBookNow = async (req, res) => {
  try {
    const getData = await booknow.find();

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
