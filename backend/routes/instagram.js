const express = require("express");
const instagramService = require("../services/instagramService");
const IPAsset = require("../models/IPAsset");
const auth = require("../middleware/auth");

const router = express.Router();

// Get Instagram OAuth URL
router.get("/oauth-url", (req, res) => {
  try {
    const { state } = req.query;
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      "http://localhost:3001/auth/instagram/callback";

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: "Instagram client ID not configured",
      });
    }

    const oauthUrl = instagramService.getOAuthUrl(clientId, redirectUri, state);

    res.json({
      success: true,
      oauthUrl: oauthUrl,
    });
  } catch (error) {
    console.error("Instagram OAuth URL error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate OAuth URL",
      error: error.message,
    });
  }
});

// Exchange authorization code for access token
router.post("/oauth/callback", async (req, res) => {
  try {
    const { code, state } = req.body;
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      "http://localhost:3001/auth/instagram/callback";

    if (!code || !clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    const tokenData = await instagramService.exchangeCodeForToken(
      clientId,
      clientSecret,
      redirectUri,
      code
    );

    // Get long-lived token
    const longLivedToken = await instagramService.getLongLivedToken(
      tokenData.access_token,
      clientSecret
    );

    res.json({
      success: true,
      accessToken: longLivedToken.access_token,
      expiresIn: longLivedToken.expires_in,
      tokenType: longLivedToken.token_type,
    });
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to exchange code for token",
      error: error.message,
    });
  }
});

// Get user's Instagram profile
router.get("/profile", auth, async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Instagram access token is required",
      });
    }

    const profile = await instagramService.getUserProfile(accessToken);

    res.json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    console.error("Get Instagram profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get Instagram profile",
      error: error.message,
    });
  }
});

// Get user's Instagram media
router.get("/media", auth, async (req, res) => {
  try {
    const { accessToken, limit = 25 } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Instagram access token is required",
      });
    }

    const media = await instagramService.getUserMedia(accessToken, limit);

    res.json({
      success: true,
      media: media.map((item) => ({
        id: item.id,
        caption: item.caption,
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url,
        permalink: item.permalink,
        timestamp: item.timestamp,
      })),
    });
  } catch (error) {
    console.error("Get Instagram media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get Instagram media",
      error: error.message,
    });
  }
});

// Get specific media details
router.get("/media/:mediaId", async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Instagram access token is required",
      });
    }

    const mediaDetails = await instagramService.getMediaDetails(
      mediaId,
      accessToken
    );

    res.json({
      success: true,
      media: mediaDetails,
    });
  } catch (error) {
    console.error("Get Instagram media details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get media details",
      error: error.message,
    });
  }
});

// Check if media is already registered
router.post("/check-media", async (req, res) => {
  try {
    const { mediaUrl, accessToken } = req.body;

    if (!mediaUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Media URL and access token are required",
      });
    }

    const result = await instagramService.checkMediaRegistration(
      mediaUrl,
      accessToken
    );

    if (result.exists) {
      // Check if media is already registered in our database
      const existingAsset = await IPAsset.findOne({ sourceUrl: mediaUrl });

      if (existingAsset) {
        return res.json({
          success: true,
          isRegistered: true,
          asset: existingAsset,
          mediaData: result.mediaData,
        });
      }
    }

    res.json({
      success: true,
      isRegistered: false,
      mediaData: result.mediaData,
    });
  } catch (error) {
    console.error("Check Instagram media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check media",
      error: error.message,
    });
  }
});

// Register Instagram media as IP asset
router.post("/register-media", auth, async (req, res) => {
  try {
    const {
      mediaUrl,
      accessToken,
      collaborators = [],
      license = {},
    } = req.body;

    if (!mediaUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Media URL and access token are required",
      });
    }

    // Get media details
    const result = await instagramService.checkMediaRegistration(
      mediaUrl,
      accessToken
    );

    if (!result.exists) {
      return res.status(404).json({
        success: false,
        message: "Media not found or not accessible",
      });
    }

    // Check if already registered
    const existingAsset = await IPAsset.findOne({ sourceUrl: mediaUrl });
    if (existingAsset) {
      return res.status(400).json({
        success: false,
        message: "Media is already registered as an IP asset",
        existingAsset: {
          id: existingAsset._id,
          title: existingAsset.title,
          owner: existingAsset.owner,
        },
      });
    }

    // Create IP asset
    const ipAssetData = {
      ...result.mediaData,
      owner: req.user.userId,
      collaborators: collaborators,
      license: license,
      status: "draft",
    };

    const asset = new IPAsset(ipAssetData);
    await asset.save();
    await asset.populate("owner", "name email profilePicture");

    res.status(201).json({
      success: true,
      asset: asset,
      message: "Instagram media registered as IP asset",
    });
  } catch (error) {
    console.error("Register Instagram media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register media as IP asset",
      error: error.message,
    });
  }
});

// Bulk register user's Instagram media
router.post("/bulk-register", auth, async (req, res) => {
  try {
    const {
      accessToken,
      limit = 10,
      collaborators = [],
      license = {},
    } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Instagram access token is required",
      });
    }

    // Get user's media
    const media = await instagramService.getUserMedia(accessToken, limit);
    const registeredAssets = [];
    const errors = [];

    for (const item of media) {
      try {
        // Check if already registered
        const existingAsset = await IPAsset.findOne({
          sourceUrl: item.permalink,
        });
        if (existingAsset) {
          errors.push({
            mediaId: item.id,
            caption: item.caption,
            error: "Already registered",
          });
          continue;
        }

        // Get detailed media info
        const mediaDetails = await instagramService.getMediaDetails(
          item.id,
          accessToken
        );
        const ipAssetData = instagramService.processMediaForIPAsset(
          mediaDetails,
          req.user.userId
        );

        if (ipAssetData) {
          const asset = new IPAsset({
            ...ipAssetData,
            owner: req.user.userId,
            collaborators: collaborators,
            license: license,
            status: "draft",
          });

          await asset.save();
          registeredAssets.push(asset);
        }
      } catch (error) {
        errors.push({
          mediaId: item.id,
          caption: item.caption,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      registeredCount: registeredAssets.length,
      errorCount: errors.length,
      registeredAssets: registeredAssets,
      errors: errors,
    });
  } catch (error) {
    console.error("Bulk register Instagram media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk register media",
      error: error.message,
    });
  }
});

module.exports = router;
