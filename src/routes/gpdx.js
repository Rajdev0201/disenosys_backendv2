const express = require('express');
const router = express.Router();
const Student = require("../models/gpdx");

router.get('/result-gpdx', async (req, res) => {

  try {
    // Query Params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    // Search Conditions
    const searchQuery = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } }
      ]
    };

    // Pagination Calculation
    const skip = (page - 1) * limit;

    // Fetch Results
    const results = await Student.find(search ? searchQuery : {})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count total docs
    const total = await Student.countDocuments(search ? searchQuery : {});

    res.status(200).json({
      message: "Data fetched",
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong", err });
  }
});

// GET /result-topFive
router.get('/result-topFive', async (req, res) => {
  try {
    const list = Number(req.query.list) || 5;
    const top5 = await Student.aggregate([
      // keep only users who attended quiz (optional)
      { $match: { attendedQuiz: true } },

      // Group by email and compute best percentage (or best totalScore)
      {
        $group: {
          _id: "$email",                            // group key (change if you want userId)
          name: { $first: "$name" },                // pick the name (first doc's name)
          mobile: { $first: "$mobile" },            // pick phone
          email: { $first: "$email" },
          bestPercentage: { $max: "$percentage" },  // BEST score per user
          lastAttemptAt: { $max: "$createdAt" },
          quizFinishTime: {$max: "$quizFinishTime"}, // optional: last attempt time
          docCount: { $sum: 1 }                     // optional: number of attempts
        }
      },

      // Sort by bestPercentage desc
      { $sort: { bestPercentage: -1 } },

      // Limit to top 5 users
      { $limit: list },

      // Optionally reshape fields for client
      {
        $project: {
          _id: 0,
          name: 1,
          mobile: 1,
          bestPercentage: 1,
          lastAttemptAt: 1,
          docCount: 1,
          quizFinishTime:1,
        }
      }
    ]);

    res.status(200).json({ message: "Top 5 performers (by best score)", data: top5 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", err });
  }
});




module.exports = router;