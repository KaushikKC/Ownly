const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Register/Login user (called from frontend after Google OAuth)
router.post("/register", async (req, res) => {
  try {
    const { email, name, profilePicture, googleId, walletAddress } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with new wallet if provided
      if (walletAddress && !user.walletAddress) {
        user.walletAddress = walletAddress;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email,
        name,
        profilePicture,
        googleId,
        walletAddress,
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("Auth registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Get current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-__v");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
});

// Update user profile
router.put("/me", auth, async (req, res) => {
  try {
    const { walletAddress, instagramHandle, youtubeChannelId, preferences } =
      req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update fields if provided
    if (walletAddress) user.walletAddress = walletAddress;
    if (instagramHandle) user.instagramHandle = instagramHandle;
    if (youtubeChannelId) user.youtubeChannelId = youtubeChannelId;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// Verify token endpoint
router.get("/verify", auth, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});

module.exports = router;
