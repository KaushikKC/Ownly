const express = require("express");
const youtubeService = require("../services/youtubeService");
const IPAsset = require("../models/IPAsset");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's YouTube channel info
router.get("/channel", auth, async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "YouTube access token is required",
      });
    }

    const channelInfo = await youtubeService.getChannelInfo(accessToken);

    res.json({
      success: true,
      channel: channelInfo,
    });
  } catch (error) {
    console.error("Get YouTube channel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get YouTube channel info",
      error: error.message,
    });
  }
});

// Get user's YouTube videos
router.get("/videos", auth, async (req, res) => {
  try {
    const { accessToken, maxResults = 50 } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "YouTube access token is required",
      });
    }

    const videos = await youtubeService.getUserVideos(accessToken, maxResults);

    res.json({
      success: true,
      videos: videos.map((video) => ({
        id: video.snippet.resourceId.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl:
          video.snippet.thumbnails?.maxres?.url ||
          video.snippet.thumbnails?.high?.url,
        publishedAt: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
      })),
    });
  } catch (error) {
    console.error("Get YouTube videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get YouTube videos",
      error: error.message,
    });
  }
});

// Get specific video details
router.get("/video/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoDetails = await youtubeService.getVideoDetails(videoId);

    if (!videoDetails) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.json({
      success: true,
      video: videoDetails,
    });
  } catch (error) {
    console.error("Get YouTube video details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video details",
      error: error.message,
    });
  }
});

// Check if video is already registered
router.post("/check-video", async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }

    const result = await youtubeService.checkVideoRegistration(videoUrl);

    if (result.exists) {
      // Check if video is already registered in our database
      const existingAsset = await IPAsset.findOne({ sourceUrl: videoUrl });

      if (existingAsset) {
        return res.json({
          success: true,
          isRegistered: true,
          asset: existingAsset,
          videoData: result.videoData,
        });
      }
    }

    res.json({
      success: true,
      isRegistered: false,
      videoData: result.videoData,
    });
  } catch (error) {
    console.error("Check YouTube video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check video",
      error: error.message,
    });
  }
});

// Test ownership verification (no auth required for testing)
router.post("/test-ownership", async (req, res) => {
  try {
    const { videoUrl, userEmail } = req.body;

    if (!videoUrl || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Video URL and user email are required",
      });
    }

    // Get video details
    const result = await youtubeService.checkVideoRegistration(videoUrl);

    if (!result.exists) {
      return res.status(404).json({
        success: false,
        message: "Video not found or not accessible",
      });
    }

    // Get user's YouTube channel ID
    const userChannelInfo = await youtubeService.getUserYouTubeChannelId(
      userEmail
    );

    if (!userChannelInfo) {
      return res.status(400).json({
        success: false,
        message: "Unable to get user's YouTube channel information",
      });
    }

    // Check if user's channel ID matches the video's channel ID
    const isOwner = userChannelInfo.channelId === result.videoData.channelId;

    res.json({
      success: true,
      isOwner: isOwner,
      channelInfo: {
        channelId: result.videoData.channelId,
        channelTitle: result.videoData.channelTitle,
        email: userEmail,
        isVerified: userChannelInfo.isVerified,
      },
      userChannelInfo: {
        channelId: userChannelInfo.channelId,
        channelTitle: userChannelInfo.title,
        email: userEmail,
      },
      videoData: result.videoData,
      message: isOwner
        ? "You are the owner of this channel. You can register this video as IP."
        : `You are not the owner of this channel. Your channel ID: ${userChannelInfo.channelId}, Video channel ID: ${result.videoData.channelId}`,
    });
  } catch (error) {
    console.error("Test ownership error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test ownership",
      error: error.message,
    });
  }
});

// Verify channel ownership for IP registration eligibility
router.post("/verify-ownership", auth, async (req, res) => {
  try {
    const { videoUrl, userEmail } = req.body;

    if (!videoUrl || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Video URL and user email are required",
      });
    }

    // Get video details
    const result = await youtubeService.checkVideoRegistration(videoUrl);

    if (!result.exists) {
      return res.status(404).json({
        success: false,
        message: "Video not found or not accessible",
      });
    }

    // Get user's YouTube channel ID
    const userChannelInfo = await youtubeService.getUserYouTubeChannelId(
      userEmail
    );

    if (!userChannelInfo) {
      return res.status(400).json({
        success: false,
        message: "Unable to get user's YouTube channel information",
      });
    }

    // Check if user's channel ID matches the video's channel ID
    const isOwner = userChannelInfo.channelId === result.videoData.channelId;

    res.json({
      success: true,
      isOwner: isOwner,
      channelInfo: {
        channelId: result.videoData.channelId,
        channelTitle: result.videoData.channelTitle,
        email: userEmail,
        isVerified: userChannelInfo.isVerified,
      },
      userChannelInfo: {
        channelId: userChannelInfo.channelId,
        channelTitle: userChannelInfo.title,
        email: userEmail,
      },
      videoData: result.videoData,
      message: isOwner
        ? "You are the owner of this channel. You can register this video as IP."
        : `You are not the owner of this channel. Your channel ID: ${userChannelInfo.channelId}, Video channel ID: ${result.videoData.channelId}`,
    });
  } catch (error) {
    console.error("Verify ownership error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify ownership",
      error: error.message,
    });
  }
});

// Register YouTube video as IP asset
router.post("/register-video", auth, async (req, res) => {
  try {
    const {
      videoUrl,
      accessToken,
      collaborators = [],
      license = {},
    } = req.body;

    if (!videoUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Video URL and access token are required",
      });
    }

    // Get video details
    const result = await youtubeService.checkVideoRegistration(videoUrl);

    if (!result.exists) {
      return res.status(404).json({
        success: false,
        message: "Video not found or not accessible",
      });
    }

    // Check if already registered
    const existingAsset = await IPAsset.findOne({ sourceUrl: videoUrl });
    if (existingAsset) {
      return res.status(400).json({
        success: false,
        message: "Video is already registered as an IP asset",
        existingAsset: {
          id: existingAsset._id,
          title: existingAsset.title,
          owner: existingAsset.owner,
        },
      });
    }

    // Create IP asset
    const ipAssetData = {
      ...result.videoData,
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
      message: "YouTube video registered as IP asset",
    });
  } catch (error) {
    console.error("Register YouTube video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register video as IP asset",
      error: error.message,
    });
  }
});

// Bulk register user's YouTube videos
router.post("/bulk-register", auth, async (req, res) => {
  try {
    const {
      accessToken,
      maxResults = 10,
      collaborators = [],
      license = {},
    } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "YouTube access token is required",
      });
    }

    // Get user's videos
    const videos = await youtubeService.getUserVideos(accessToken, maxResults);
    const registeredAssets = [];
    const errors = [];

    for (const video of videos) {
      try {
        const videoUrl = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;

        // Check if already registered
        const existingAsset = await IPAsset.findOne({ sourceUrl: videoUrl });
        if (existingAsset) {
          errors.push({
            videoId: video.snippet.resourceId.videoId,
            title: video.snippet.title,
            error: "Already registered",
          });
          continue;
        }

        // Get detailed video info
        const videoDetails = await youtubeService.getVideoDetails(
          video.snippet.resourceId.videoId
        );
        const ipAssetData = youtubeService.processVideoForIPAsset(
          videoDetails,
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
          videoId: video.snippet.resourceId.videoId,
          title: video.snippet.title,
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
    console.error("Bulk register YouTube videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk register videos",
      error: error.message,
    });
  }
});

module.exports = router;
