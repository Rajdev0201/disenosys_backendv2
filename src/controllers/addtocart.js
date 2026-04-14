const Cart = require("../models/addtocart");

exports.postCart = async (req, res) => {
  try {
    const userId = req.user._id;
    if(!userId){  
      return res.status(400).json({
         message: "Please login before enroll your course",
      })
    }
    const {course, price, quantity = 1, img } = req.body;

    if (!course || !price) {
      return res.status(400).json({
        success: false,
        message: "Course and price are required",
      });
    }

    // Check if item already exists for this user
    const existingItem = await Cart.findOne({ user: userId, course });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart updated",
        cartItem: existingItem,
      });
    }

    const cartItem = await Cart.create({
      user: userId,
      course,
      price,
      quantity,
      img,
    });

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cartItem,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to add to cart",
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login before accessing cart",
      });
    }

    const cartItems = await Cart.find({ user: userId })
      .populate({
        path: "course",
        select: "courseName",
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: cartItems.length,
      cartItems,
    });

  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};


exports.increment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

      if(!userId){  
      return res.status(400).json({
         message: "Please login before enroll your course",
      })
    }
    const item = await Cart.findOne({ _id: id, user: userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.quantity += 1;
    await item.save();

    res.status(200).json({
      success: true,
      cartItem: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

exports.decrement = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const item = await Cart.findOne({ _id: id, user: userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
      await item.save();
    } else {
      await item.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

exports.removeCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

      if(!userId){  
      return res.status(400).json({
         message: "Please login before enroll your course",
      })
    }

    const deletedItem = await Cart.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item",
    });
  }
};

