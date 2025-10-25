const express = require("express");
const IPAsset = require("../models/IPAsset");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all IP assets for a user
router.get("/my-assets", async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query parameters

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const assets = await IPAsset.find({ owner: userId })
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

// Get disputed IPs
router.get("/disputed-ips", async (req, res) => {
  try {
    const disputedAssets = await IPAsset.find({
      status: "disputed",
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

// Create new IP asset
router.post("/", async (req, res) => {
  try {
    console.log("=== POST /ip-assets ===");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("ownerId in body:", req.body.ownerId);
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
      ownerId, // Get owner ID from request body
      owner, // Alternative field name
    } = req.body;

    console.log("Creating IP asset with ownerId:", ownerId);
    console.log("Full request body:", JSON.stringify(req.body, null, 2));

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

    const finalOwnerId =
      ownerId || owner || req.user?.userId || "507f1f77bcf86cd799439011";
    console.log("Final owner ID:", finalOwnerId);

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
      owner: finalOwnerId, // Use ownerId from request body
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
router.put("/:id", async (req, res) => {
  try {
    const asset = await IPAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Check if user owns the asset (skip for testing)
    // if (asset.owner.toString() !== req.user?.userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to update this asset",
    //   });
    // }

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
        owner: existingAsset.owner,
        asset: {
          id: existingAsset._id,
          title: existingAsset.title,
          status: existingAsset.status,
          registeredAt: existingAsset.registeredAt || existingAsset.createdAt,
          storyProtocolAssetId: existingAsset.storyProtocolAssetId,
          thumbnailUrl: existingAsset.thumbnailUrl,
          sourceUrl: existingAsset.sourceUrl,
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
router.post("/check-violations", async (req, res) => {
  try {
    const { sourceUrl, title, thumbnailUrl, currentUserId } = req.body;

    console.log("Checking violations for:", {
      sourceUrl,
      title,
      thumbnailUrl,
      currentUserId,
    });

    // Check for exact URL matches (always a violation regardless of user)
    const urlMatch = await IPAsset.findOne({
      sourceUrl: sourceUrl,
      status: { $in: ["registered", "pending"] },
    }).populate("owner", "name email");

    // Advanced title similarity detection - only flag if same user or very high similarity
    const titleMatches = await IPAsset.find({
      $or: [
        { title: { $regex: title, $options: "i" } },
        { title: { $regex: title.replace(/[^\w\s]/g, ""), $options: "i" } }, // Remove special chars
        {
          title: {
            $regex: title.split(" ").slice(0, 3).join(" "),
            $options: "i",
          },
        }, // First 3 words
      ],
      status: { $in: ["registered", "pending"] },
    }).populate("owner", "name email");

    // Advanced thumbnail matching
    let thumbnailMatches = [];
    if (thumbnailUrl) {
      // Check for exact thumbnail matches
      const exactThumbnailMatches = await IPAsset.find({
        thumbnailUrl: thumbnailUrl,
        status: { $in: ["registered", "pending"] },
      }).populate("owner", "name email");

      // Check for similar thumbnail URLs (different sizes, same video)
      const baseThumbnailUrl = thumbnailUrl.split("?")[0]; // Remove query params
      const similarThumbnailMatches = await IPAsset.find({
        thumbnailUrl: {
          $regex: baseThumbnailUrl.replace(/\/[^\/]+$/, ""),
          $options: "i",
        },
        status: { $in: ["registered", "pending"] },
      }).populate("owner", "name email");

      thumbnailMatches = [...exactThumbnailMatches, ...similarThumbnailMatches];
    }

    // Calculate similarity scores
    const calculateSimilarity = (str1, str2) => {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      if (longer.length === 0) return 1.0;
      const editDistance = levenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    };

    const violations = {
      urlMatch: urlMatch
        ? {
            assetId: urlMatch._id,
            owner: urlMatch.owner,
            title: urlMatch.title,
            registeredAt: urlMatch.registeredAt,
            storyProtocolAssetId: urlMatch.storyProtocolAssetId,
            similarity: 1.0, // Exact match
          }
        : null,
      titleMatches: titleMatches.map((asset) => ({
        assetId: asset._id,
        owner: asset.owner,
        title: asset.title,
        registeredAt: asset.registeredAt,
        storyProtocolAssetId: asset.storyProtocolAssetId,
        similarity: calculateSimilarity(
          title.toLowerCase(),
          asset.title.toLowerCase()
        ),
      })),
      thumbnailMatches: thumbnailMatches.map((asset) => ({
        assetId: asset._id,
        owner: asset.owner,
        title: asset.title,
        registeredAt: asset.registeredAt,
        storyProtocolAssetId: asset.storyProtocolAssetId,
        similarity: 1.0, // Exact thumbnail match
      })),
    };

    // Log all found matches before filtering
    console.log("Found title matches:", violations.titleMatches.length);
    console.log("Found thumbnail matches:", violations.thumbnailMatches.length);

    // Filter matches by similarity threshold and user context
    const SIMILARITY_THRESHOLD = 0.7;
    const filteredTitleMatches = violations.titleMatches.filter((match) => {
      const similarity = match.similarity;
      const isSameUser =
        currentUserId &&
        match.owner &&
        match.owner._id.toString() === currentUserId;

      // Flag if: same user OR very high similarity (95%+)
      // For legacy data without owner info, only flag if very high similarity (98%+)
      return (
        similarity >= SIMILARITY_THRESHOLD &&
        (isSameUser ||
          similarity >= 0.95 ||
          (!match.owner && similarity >= 0.98))
      );
    });

    // Filter thumbnail matches similarly
    const filteredThumbnailMatches = violations.thumbnailMatches.filter(
      (match) => {
        const isSameUser =
          currentUserId &&
          match.owner &&
          match.owner._id.toString() === currentUserId;
        // Flag if: same user OR exact thumbnail match
        // For legacy data without owner info, only flag exact matches
        return isSameUser || match.similarity >= 1.0;
      }
    );

    // Log filtered results
    console.log("Filtered title matches:", filteredTitleMatches.length);
    console.log("Filtered thumbnail matches:", filteredThumbnailMatches.length);
    console.log("URL match:", !!violations.urlMatch);

    // URL matches are always violations (same URL = same video)
    // Title/thumbnail matches are only violations if filtered
    const hasViolations =
      !!violations.urlMatch ||
      filteredTitleMatches.length > 0 ||
      filteredThumbnailMatches.length > 0;

    console.log("Final hasViolations:", hasViolations);

    res.json({
      success: true,
      hasViolations,
      violations: {
        ...violations,
        titleMatches: filteredTitleMatches,
        thumbnailMatches: filteredThumbnailMatches,
      },
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
router.post("/record-dispute", async (req, res) => {
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

// Get Story Protocol data for an asset
router.get("/:assetId/story-protocol", async (req, res) => {
  try {
    const { assetId } = req.params;

    const asset = await IPAsset.findById(assetId).populate(
      "owner",
      "name email profilePicture walletAddress"
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Return Story Protocol data if available
    const storyProtocolData = {
      storyProtocolAssetId: asset.storyProtocolAssetId,
      nftTokenId: asset.nftTokenId,
      nftContractAddress: asset.nftContractAddress,
      license: asset.license,
      status: asset.status,
      registeredAt: asset.registeredAt,
    };

    res.json({
      success: true,
      storyProtocolData,
    });
  } catch (error) {
    console.error("Get Story Protocol data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get Story Protocol data",
      error: error.message,
    });
  }
});

// Levenshtein distance function for similarity calculation
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

module.exports = router;
