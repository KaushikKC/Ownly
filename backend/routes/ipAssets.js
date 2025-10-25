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

// Check for IP violations/duplicates
router.post("/check-violations", auth, async (req, res) => {
  try {
    const { sourceUrl, title, thumbnailUrl } = req.body;

    // Check for exact URL matches
    const urlMatch = await IPAsset.findOne({
      sourceUrl: sourceUrl,
      status: { $in: ["registered", "pending"] },
    }).populate("owner", "name email");

    // Check for similar titles (basic similarity check)
    const titleMatches = await IPAsset.find({
      title: { $regex: title, $options: "i" },
      status: { $in: ["registered", "pending"] },
    }).populate("owner", "name email");

    // Check for thumbnail hash matches (if thumbnailUrl provided)
    let thumbnailMatches = [];
    if (thumbnailUrl) {
      thumbnailMatches = await IPAsset.find({
        thumbnailUrl: thumbnailUrl,
        status: { $in: ["registered", "pending"] },
      }).populate("owner", "name email");
    }

    const violations = {
      urlMatch: urlMatch
        ? {
            assetId: urlMatch._id,
            owner: urlMatch.owner,
            title: urlMatch.title,
            registeredAt: urlMatch.registeredAt,
            storyProtocolAssetId: urlMatch.storyProtocolAssetId,
          }
        : null,
      titleMatches: titleMatches.map((asset) => ({
        assetId: asset._id,
        owner: asset.owner,
        title: asset.title,
        registeredAt: asset.registeredAt,
        storyProtocolAssetId: asset.storyProtocolAssetId,
      })),
      thumbnailMatches: thumbnailMatches.map((asset) => ({
        assetId: asset._id,
        owner: asset.owner,
        title: asset.title,
        registeredAt: asset.registeredAt,
        storyProtocolAssetId: asset.storyProtocolAssetId,
      })),
    };

    const hasViolations =
      violations.urlMatch ||
      violations.titleMatches.length > 0 ||
      violations.thumbnailMatches.length > 0;

    res.json({
      success: true,
      hasViolations,
      violations,
    });
  } catch (error) {
    console.error("Check violations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check for violations",
      error: error.message,
    });
  }
});

// Record IP dispute
router.post("/record-dispute", auth, async (req, res) => {
  try {
    const {
      assetId,
      disputeReason,
      claimantAddress,
      storyProtocolDisputeId,
      transactionHash,
    } = req.body;

    const asset = await IPAsset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Create dispute record
    const dispute = {
      assetId: assetId,
      claimantId: req.user.userId,
      claimantAddress: claimantAddress,
      disputeReason: disputeReason,
      storyProtocolDisputeId: storyProtocolDisputeId,
      transactionHash: transactionHash,
      status: "pending",
      createdAt: new Date(),
    };

    // Update asset with dispute
    const updatedAsset = await IPAsset.findByIdAndUpdate(
      assetId,
      {
        $push: { disputes: dispute },
        status: "disputed",
      },
      { new: true }
    ).populate("owner", "name email");

    res.json({
      success: true,
      dispute,
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Record dispute error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record dispute",
      error: error.message,
    });
  }
});

// Get disputed IPs
router.get("/disputed-ips", auth, async (req, res) => {
  try {
    const disputedAssets = await IPAsset.find({
      status: "disputed",
      $or: [
        { owner: req.user.userId },
        { "disputes.claimantId": req.user.userId },
      ],
    }).populate("owner", "name email");

    res.json({
      success: true,
      disputedAssets,
    });
  } catch (error) {
    console.error("Get disputed IPs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get disputed IPs",
      error: error.message,
    });
  }
});

// Save Story Protocol data to MongoDB
router.post("/save-story-protocol", async (req, res) => {
  try {
    const { assetId, storyProtocolData } = req.body;

    const asset = await IPAsset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // No authentication required - this is just saving Story Protocol data
    // Update asset with Story Protocol data
    const updatedAsset = await IPAsset.findByIdAndUpdate(
      assetId,
      {
        nftTokenId: storyProtocolData.nftTokenId,
        nftContractAddress: storyProtocolData.nftContractAddress,
        storyProtocolAssetId: storyProtocolData.storyProtocolAssetId,
        status: "registered",
        registeredAt: new Date(),
        license: {
          ...asset.license,
          storyProtocolLicenseId: storyProtocolData.licenseId,
        },
      },
      { new: true }
    ).populate("owner", "name email profilePicture walletAddress");

    res.json({
      success: true,
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Save Story Protocol data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save Story Protocol data",
      error: error.message,
    });
  }
});

module.exports = router;
