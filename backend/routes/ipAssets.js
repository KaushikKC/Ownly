const express = require("express");
const IPAsset = require("../models/IPAsset");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all IP assets for a user
router.get("/my-assets", auth, async (req, res) => {
  try {
    const assets = await IPAsset.find({ owner: req.user.userId })
      .populate("owner", "name email profilePicture")
      .populate("collaborators.userId", "name email walletAddress")
      .sort({ createdAt: -1 });

    res.json({ success: true, assets });
  } catch (error) {
    console.error("Get user assets error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get assets",
      error: error.message,
    });
  }
});

// Get all IP assets (public)
router.get("/", async (req, res) => {
  try {
    const { status = "registered", page = 1, limit = 10 } = req.query;

    const assets = await IPAsset.find({ status })
      .populate("owner", "name email profilePicture")
      .populate("collaborators.userId", "name email walletAddress")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await IPAsset.countDocuments({ status });

    res.json({
      success: true,
      assets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get assets error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get assets",
      error: error.message,
    });
  }
});

// Create new IP asset
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      sourceUrl,
      sourcePlatform,
      thumbnailUrl,
      duration,
      fileSize,
      contentHash,
      audioFingerprint,
      visualFingerprint,
      collaborators,
      license,
    } = req.body;

    // Check if asset with same URL already exists
    const existingAsset = await IPAsset.findOne({ sourceUrl });
    if (existingAsset) {
      return res.status(400).json({
        success: false,
        message: "Asset with this URL already exists",
        existingAsset: {
          id: existingAsset._id,
          title: existingAsset.title,
          owner: existingAsset.owner,
        },
      });
    }

    const asset = new IPAsset({
      title,
      description,
      sourceUrl,
      sourcePlatform,
      thumbnailUrl,
      duration,
      fileSize,
      contentHash,
      audioFingerprint,
      visualFingerprint,
      owner: req.user.userId,
      collaborators: collaborators || [],
      license: license || {},
    });

    await asset.save();
    await asset.populate("owner", "name email profilePicture");

    res.status(201).json({ success: true, asset });
  } catch (error) {
    console.error("Create asset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create asset",
      error: error.message,
    });
  }
});

// Get specific IP asset
router.get("/:id", async (req, res) => {
  try {
    const asset = await IPAsset.findById(req.params.id)
      .populate("owner", "name email profilePicture walletAddress")
      .populate("collaborators.userId", "name email walletAddress");

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.json({ success: true, asset });
  } catch (error) {
    console.error("Get asset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get asset",
      error: error.message,
    });
  }
});

// Update IP asset
router.put("/:id", auth, async (req, res) => {
  try {
    const asset = await IPAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Check if user owns the asset
    if (asset.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this asset",
      });
    }

    const updatedAsset = await IPAsset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("owner", "name email profilePicture");

    res.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error("Update asset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update asset",
      error: error.message,
    });
  }
});

// Check if URL is already registered
router.post("/check-url", async (req, res) => {
  try {
    const { sourceUrl } = req.body;

    const existingAsset = await IPAsset.findOne({ sourceUrl }).populate(
      "owner",
      "name email profilePicture"
    );

    if (existingAsset) {
      return res.json({
        success: true,
        isRegistered: true,
        asset: {
          id: existingAsset._id,
          title: existingAsset.title,
          owner: existingAsset.owner,
          status: existingAsset.status,
        },
      });
    }

    res.json({ success: true, isRegistered: false });
  } catch (error) {
    console.error("Check URL error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check URL",
      error: error.message,
    });
  }
});

module.exports = router;
