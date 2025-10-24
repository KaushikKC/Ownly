const express = require("express");
const IPAsset = require("../models/IPAsset");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Add collaborator to IP asset
router.post("/:assetId", auth, async (req, res) => {
  try {
    const {
      userId,
      walletAddress,
      ownershipPercentage,
      role = "collaborator",
    } = req.body;
    const assetId = req.params.assetId;

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
        message: "Not authorized to add collaborators to this asset",
      });
    }

    // Check if collaborator already exists
    const existingCollaborator = asset.collaborators.find(
      (c) => c.userId.toString() === userId || c.walletAddress === walletAddress
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: "Collaborator already exists",
      });
    }

    // Validate ownership percentage
    const totalOwnership = asset.collaborators.reduce(
      (sum, c) => sum + c.ownershipPercentage,
      0
    );
    if (totalOwnership + ownershipPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Total ownership cannot exceed 100%",
      });
    }

    // Add collaborator
    asset.collaborators.push({
      userId,
      walletAddress,
      ownershipPercentage,
      role,
      approved: false,
    });

    await asset.save();
    await asset.populate("collaborators.userId", "name email profilePicture");

    res.json({ success: true, asset });
  } catch (error) {
    console.error("Add collaborator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add collaborator",
      error: error.message,
    });
  }
});

// Update collaborator approval
router.put("/:assetId/:collaboratorId", auth, async (req, res) => {
  try {
    const { assetId, collaboratorId } = req.params;
    const { approved, ownershipPercentage } = req.body;

    const asset = await IPAsset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Find the collaborator
    const collaborator = asset.collaborators.id(collaboratorId);
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: "Collaborator not found",
      });
    }

    // Check if user is the collaborator or asset owner
    const isCollaborator = collaborator.userId.toString() === req.user.userId;
    const isOwner = asset.owner.toString() === req.user.userId;

    if (!isCollaborator && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this collaborator",
      });
    }

    // Update collaborator
    if (approved !== undefined) collaborator.approved = approved;
    if (ownershipPercentage !== undefined)
      collaborator.ownershipPercentage = ownershipPercentage;

    await asset.save();
    await asset.populate("collaborators.userId", "name email profilePicture");

    res.json({ success: true, asset });
  } catch (error) {
    console.error("Update collaborator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update collaborator",
      error: error.message,
    });
  }
});

// Remove collaborator
router.delete("/:assetId/:collaboratorId", auth, async (req, res) => {
  try {
    const { assetId, collaboratorId } = req.params;

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
        message: "Not authorized to remove collaborators from this asset",
      });
    }

    // Remove collaborator
    asset.collaborators.id(collaboratorId).remove();
    await asset.save();

    res.json({ success: true, message: "Collaborator removed" });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove collaborator",
      error: error.message,
    });
  }
});

// Get collaborators for an asset
router.get("/:assetId", async (req, res) => {
  try {
    const asset = await IPAsset.findById(req.params.assetId)
      .populate(
        "collaborators.userId",
        "name email profilePicture walletAddress"
      )
      .select("collaborators");

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.json({ success: true, collaborators: asset.collaborators });
  } catch (error) {
    console.error("Get collaborators error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get collaborators",
      error: error.message,
    });
  }
});

module.exports = router;
