const express = require("express");
const IPAsset = require("../models/IPAsset");
const auth = require("../middleware/auth");

const router = express.Router();

// Save Story Protocol data to MongoDB
router.post("/save-story-protocol", auth, async (req, res) => {
  try {
    const { assetId, storyProtocolData } = req.body;

    const asset = await IPAsset.findById(assetId);
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
