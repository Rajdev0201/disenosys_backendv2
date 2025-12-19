const addtocart = require("../models/addtocart");
const userAuth = require("../models/userAuth");

exports.postCart = async (req, res) => {
  const userId = req.user._id;
  const { courseId, name, price, quantity, img, userName } = req.body;

  if (!courseId || !name || !price || !quantity || !img || !userName) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields in request body.",
    });
  }

  try {
    const toUser = await userAuth.findById(userId);

    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = await addtocart.findOne({ courseId, userName });

    let cartItem;

    if (existingItem) {
      existingItem.quantity += quantity;
      cartItem = await existingItem.save();
    } else {
      cartItem = await addtocart.create({
        courseId,
        name,
        price,
        quantity,
        img,
        userName,
      });
    }

    res.status(201).json({
      success: true,
      cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "There was an issue saving the cart item.",
    });
  }
};

exports.getCart = async (req, res) => {
  const cartItems = await addtocart.find();
  if(!cartItems){
    return res.status(400).json({message:"cart items not found!."})
  }
  res.status(200).json({
    success: true,
    cartItems,
  });
};

exports.increament = async (req, res, next) => {
  const { id } = req.params;
  const item = await addtocart.findById(id);

  if (!item) {
    return res.status(400).json({ message: "Item not found" });
  }

  item.quantity += 1;
  await item.save();

  res.status(200).json({
    success: true,
    item,
  });
};

exports.decreament = async (req, res, next) => {
  const { id } = req.params;
  const item = await addtocart.findById(id);

  if (!item) {
    return res.status(400).json({ message: "Item not found" });
  }

  if (item.quantity > 1) {
    item.quantity -= 1; // Decrease the quantity
    item.totalPrice -= item.price; // Update total price
    await item.save(); // Save the changes to the item
  } else {
    // Optionally handle the case where quantity is 1
    // You might want to remove the item or send a message
  }

  res.status(200).json({
    success: true,
    item,
  });
};

exports.removeCart = async (req, res, next) => {
  const { id } = req.params;

  const item = await addtocart.findByIdAndDelete(id);

  if (!item) {
    return res.status(400).json({ message: "Item not found" });
  }
  res.status(200).json({
    success: true,
    message: "Item removed successfully",
    deletedItem: item,
  });
};
