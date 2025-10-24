const express = require("express");
const User = require("../models/User");
const IPAsset = require("../models/IPAsset");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user profile by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v -preferences");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's public assets
    const assets = await IPAsset.find({
      owner: req.params.id,
      status: "registered",
    })
      .select("title thumbnailUrl createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        instagramHandle: user.instagramHandle,
        youtubeChannelId: user.youtubeChannelId,
        createdAt: user.createdAt,
      },
      recentAssets: assets,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
});

// Search users
router.get("/", async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    let query = {};
    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { instagramHandle: { $regex: q, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select(
        "name email profilePicture instagramHandle youtubeChannelId createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
});

// Get user's assets count and stats
router.get("/:id/stats", async (req, res) => {
  try {
    const userId = req.params.id;

    const stats = await IPAsset.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAssets = await IPAsset.countDocuments({ owner: userId });
    const registeredAssets = await IPAsset.countDocuments({
      owner: userId,
      status: "registered",
    });

    res.json({
      success: true,
      stats: {
        totalAssets,
        registeredAssets,
        breakdown: stats,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user stats",
      error: error.message,
    });
  }
});

module.exports = router;
