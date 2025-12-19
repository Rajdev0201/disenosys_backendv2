
const placement = require("../models/placement");

exports.postPlacement = async (req, res) => {
  const { name, email, phone,course } = req.body;
  try {
    if (!name || !email || !phone || !course) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const placement = new placement({
      name,
      email,
      phone,
      course
    });
    await placement.save();
    return res.status(200).json({ message: "Post successfully", placement });
  } catch (err) {
    return res.status(500).json({ message: "Post data gets error", err });
  }
};

exports.getPlacement = async (req, res) => {
  try {
    const getData = await placement.find();

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
