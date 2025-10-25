const { google } = require("googleapis");

class YouTubeService {
  constructor() {
    this.youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  // Get user's YouTube channel info
  async getChannelInfo(accessToken) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client,
      });

      const response = await youtube.channels.list({
        part: "snippet,contentDetails,statistics",
        mine: true,
      });

      return response.data.items[0] || null;
    } catch (error) {
      console.error("YouTube channel info error:", error);
      throw error;
    }
  }

  // Get channel info by channel ID (for ownership verification)
  async getChannelInfoByChannelId(channelId) {
    try {
      // For now, we'll return mock data since we need OAuth to get real channel details
      // In production, you'd need to implement proper channel verification
      return {
        channelId: channelId,
        email: "mock@example.com", // This would be the actual channel owner's email
        isVerified: true,
        title: "Mock Channel",
        description: "Mock channel description",
      };
    } catch (error) {
      console.error("Get channel info by ID error:", error);
      throw error;
    }
  }

  // Get user's YouTube channel ID from their Google account
  async getUserYouTubeChannelId(userEmail) {
    try {
      console.log(`Getting YouTube channel for user: ${userEmail}`);

      // For now, we'll use a simple approach:
      // 1. Check if user has a known channel ID (you can add your real channel ID here)
      // 2. In production, you'd use YouTube OAuth to get the actual channel

      // TODO: Replace this with your actual YouTube channel ID for testing
      // You can find your channel ID by going to your YouTube channel and looking at the URL
      // or by using the YouTube API

      const knownChannels = {
        // Add your email and channel ID here for testing
        // "your-email@gmail.com": "UCyour-actual-channel-id",
        // Example:
        // "kaushikk@gmail.com": "UCuAXFkgsw1L7xaCfnd5JJOw", // Rick Astley's channel for demo
      };

      const userChannelId = knownChannels[userEmail];

      if (userChannelId) {
        return {
          channelId: userChannelId,
          email: userEmail,
          isVerified: true,
          title: "User's YouTube Channel",
        };
      }

      // If no known channel, return a mock one for demo
      return {
        channelId: "UC" + Math.random().toString(36).substr(2, 22), // Mock channel ID
        email: userEmail,
        isVerified: true,
        title: "User's YouTube Channel",
      };
    } catch (error) {
      console.error("Get user YouTube channel error:", error);
      throw error;
    }
  }

  // Get user's YouTube channel ID using YouTube OAuth (for production)
  async getUserYouTubeChannelWithOAuth(accessToken) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client,
      });

      // Get user's channel information
      const response = await youtube.channels.list({
        part: "snippet,contentDetails,statistics",
        mine: true,
      });

      if (response.data.items && response.data.items.length > 0) {
        const channel = response.data.items[0];
        return {
          channelId: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnailUrl: channel.snippet.thumbnails?.default?.url,
          subscriberCount: channel.statistics?.subscriberCount,
          videoCount: channel.statistics?.videoCount,
          viewCount: channel.statistics?.viewCount,
          isVerified: true,
        };
      }

      return null;
    } catch (error) {
      console.error("Get user YouTube channel with OAuth error:", error);
      throw error;
    }
  }

  // Get user's uploaded videos
  async getUserVideos(accessToken, maxResults = 50) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client,
      });

      // First, get the channel's uploads playlist
      const channelResponse = await youtube.channels.list({
        part: "contentDetails",
        mine: true,
      });

      if (!channelResponse.data.items.length) {
        return [];
      }

      const uploadsPlaylistId =
        channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

      // Get videos from uploads playlist
      const response = await youtube.playlistItems.list({
        part: "snippet,contentDetails",
        playlistId: uploadsPlaylistId,
        maxResults: maxResults,
      });

      return response.data.items || [];
    } catch (error) {
      console.error("YouTube user videos error:", error);
      throw error;
    }
  }

  // Get detailed video information
  async getVideoDetails(videoId) {
    try {
      // Check if we have a valid API key
      if (
        !process.env.YOUTUBE_API_KEY ||
        process.env.YOUTUBE_API_KEY === "your-youtube-api-key"
      ) {
        console.log("Using mock YouTube data for development");
        return this.getMockVideoData(videoId);
      }

      const response = await this.youtube.videos.list({
        part: "snippet,contentDetails,statistics,status",
        id: videoId,
      });

      return response.data.items[0] || null;
    } catch (error) {
      console.error("YouTube video details error:", error);
      // Fallback to mock data if API fails
      console.log("Falling back to mock YouTube data");
      return this.getMockVideoData(videoId);
    }
  }

  // Mock video data for development/testing
  getMockVideoData(videoId) {
    return {
      id: videoId,
      snippet: {
        title: "Amazing Music Video - Demo Track",
        description:
          "This is a demo music video showcasing amazing visuals and audio. Perfect for testing the Ownly platform!",
        publishedAt: new Date().toISOString(),
        channelId: "UCdemo123456789",
        channelTitle: "Demo Channel",
        thumbnails: {
          high: {
            url: "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg",
          },
          maxres: {
            url: "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg",
          },
        },
        tags: ["music", "demo", "test", "amazing"],
        categoryId: "10", // Music category
        defaultLanguage: "en",
        defaultAudioLanguage: "en",
      },
      contentDetails: {
        duration: "PT4M13S", // 4 minutes 13 seconds
      },
      statistics: {
        viewCount: "1250000",
        likeCount: "45000",
        commentCount: "3200",
      },
      status: {
        privacyStatus: "public",
      },
    };
  }

  // Search for videos by URL
  async getVideoByUrl(url) {
    try {
      // Extract video ID from YouTube URL
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      return await this.getVideoDetails(videoId);
    } catch (error) {
      console.error("YouTube video by URL error:", error);
      throw error;
    }
  }

  // Extract video ID from YouTube URL
  extractVideoId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  // Process video data for IP asset creation
  processVideoForIPAsset(videoData, userChannelId) {
    if (!videoData) return null;

    const snippet = videoData.snippet;
    const contentDetails = videoData.contentDetails;
    const statistics = videoData.statistics;

    return {
      title: snippet.title,
      description: snippet.description,
      sourceUrl: `https://www.youtube.com/watch?v=${videoData.id}`,
      sourcePlatform: "youtube",
      thumbnailUrl:
        snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url,
      duration: this.parseDuration(contentDetails.duration),
      fileSize: null, // YouTube doesn't provide file size
      contentHash: null, // Will be generated later
      audioFingerprint: null, // Will be generated later
      visualFingerprint: null, // Will be generated later
      // Add channel title and other fields at top level for frontend
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      viewCount: parseInt(statistics?.viewCount || 0),
      likeCount: parseInt(statistics?.likeCount || 0),
      commentCount: parseInt(statistics?.commentCount || 0),
      publishedAt: snippet.publishedAt,
      metadata: {
        videoId: videoData.id,
        channelId: snippet.channelId || userChannelId,
        publishedAt: snippet.publishedAt,
        viewCount: parseInt(statistics?.viewCount || 0),
        likeCount: parseInt(statistics?.likeCount || 0),
        commentCount: parseInt(statistics?.commentCount || 0),
        tags: snippet.tags || [],
        categoryId: snippet.categoryId,
        defaultLanguage: snippet.defaultLanguage,
        defaultAudioLanguage: snippet.defaultAudioLanguage,
      },
    };
  }

  // Parse YouTube duration (PT4M13S) to seconds
  parseDuration(duration) {
    if (!duration) return 0;

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Check if video is already registered
  async checkVideoRegistration(videoUrl) {
    try {
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const videoData = await this.getVideoDetails(videoId);
      return {
        exists: !!videoData,
        videoData: videoData
          ? this.processVideoForIPAsset(videoData, videoData.snippet.channelId)
          : null,
      };
    } catch (error) {
      console.error("YouTube video registration check error:", error);
      throw error;
    }
  }
}

module.exports = new YouTubeService();
