const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Google OAuth data
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },

  // Wallet information
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
  },

  // Social media connections
  instagramHandle: {
    type: String,
  },
  youtubeChannelId: {
    type: String,
  },

  // User preferences
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);
