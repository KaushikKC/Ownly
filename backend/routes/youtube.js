const express = require("express");
const youtubeService = require("../services/youtubeService");
const auth = require("../middleware/auth");

const router = express.Router();

// Get YouTube channel information
router.get("/channel", auth, async (req, res) => {
  try {
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "YouTube access token is required",
      });
    }

    const channelInfo = await youtubeService.getUserYouTubeChannelWithOAuth(accessToken);
    
    if (!channelInfo) {
      return res.status(404).json({
        success: false,
        message: "No YouTube channel found for this account",
      });
    }

    res.json({
      success: true,
      channelInfo,
    });
  } catch (error) {
    console.error("Get YouTube channel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get YouTube channel",
      error: error.message,
    });
  }
});

// Get user's uploaded videos
router.get("/videos", auth, async (req, res) => {
  try {
    const { accessToken, maxResults = 50 } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "YouTube access token is required",
      });
    }

    const videos = await youtubeService.getUserVideos(accessToken, parseInt(maxResults));
    
    res.json({
      success: true,
      videos,
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
router.get("/video/:videoId", auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "YouTube access token is required",
      });
    }

    const videoDetails = await youtubeService.getVideoDetails(videoId);
    
    if (!videoDetails) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.json({
      success: true,
      videoDetails,
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

// Check if a video is already registered
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
    
    res.json({
      success: true,
      exists: result.exists,
      videoData: result.videoData,
    });
  } catch (error) {
    console.error("Check video registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check video registration",
      error: error.message,
    });
  }
});

// Register a single video as IP asset
router.post("/register-video", auth, async (req, res) => {
  try {
    const { videoUrl, accessToken, collaborators = [] } = req.body;
    
    if (!videoUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Video URL and access token are required",
      });
    }

    const result = await youtubeService.registerVideo(videoUrl, accessToken, collaborators);
    
    res.json({
      success: true,
      message: "Video registered successfully",
      ipAsset: result,
    });
  } catch (error) {
    console.error("Register video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register video",
      error: error.message,
    });
  }
});

// Bulk register multiple videos
router.post("/bulk-register", auth, async (req, res) => {
  try {
    const { videoUrls, accessToken, collaborators = [] } = req.body;
    
    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Video URLs array is required",
      });
    }
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "YouTube access token is required",
      });
    }

    const results = await youtubeService.bulkRegisterVideos(videoUrls, accessToken, collaborators);
    
    res.json({
      success: true,
      message: `${results.length} videos processed`,
      results,
    });
  } catch (error) {
    console.error("Bulk register videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk register videos",
      error: error.message,
    });
  }
});

// Verify ownership of a YouTube video
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

    // Get user from database to check their stored YouTube channel ID
    const User = require("../models/User");
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.youtubeChannelId) {
      return res.status(400).json({
        success: false,
        message: "User has not linked their YouTube channel. Please link your YouTube channel first.",
      });
    }

    // Check if user's channel ID matches the video's channel ID
    const isOwner = user.youtubeChannelId === result.videoData.channelId;

    res.json({
      success: true,
      isOwner: isOwner,
      channelInfo: {
        channelId: result.videoData.channelId,
        channelTitle: result.videoData.channelTitle,
        email: userEmail,
        isVerified: true,
      },
      userChannelInfo: {
        channelId: user.youtubeChannelId,
        channelTitle: "User's YouTube Channel",
        email: userEmail,
      },
      videoData: result.videoData,
      message: isOwner
        ? "You are the owner of this channel. You can register this video as IP."
        : `You are not the owner of this channel. Your channel ID: ${user.youtubeChannelId}, Video channel ID: ${result.videoData.channelId}`,
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

// Test ownership verification (without auth for easier testing)
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

    // Get user from database to check their stored YouTube channel ID
    const User = require("../models/User");
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.youtubeChannelId) {
      return res.status(400).json({
        success: false,
        message: "User has not linked their YouTube channel. Please link your YouTube channel first.",
      });
    }

    // Check if user's channel ID matches the video's channel ID
    const isOwner = user.youtubeChannelId === result.videoData.channelId;

    res.json({
      success: true,
      isOwner: isOwner,
      channelInfo: {
        channelId: result.videoData.channelId,
        channelTitle: result.videoData.channelTitle,
        email: userEmail,
        isVerified: true,
      },
      userChannelInfo: {
        channelId: user.youtubeChannelId,
        channelTitle: "User's YouTube Channel",
        email: userEmail,
      },
      videoData: result.videoData,
      message: isOwner
        ? "You are the owner of this channel. You can register this video as IP."
        : `You are not the owner of this channel. Your channel ID: ${user.youtubeChannelId}, Video channel ID: ${result.videoData.channelId}`,
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

module.exports = router;
