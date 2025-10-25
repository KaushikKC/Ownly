const axios = require("axios");

class InstagramService {
  constructor() {
    this.baseURL = "https://graph.instagram.com";
    this.apiVersion = "v18.0";
  }

  // Get user's Instagram profile
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.apiVersion}/me`,
        {
          params: {
            fields: "id,username,account_type,media_count",
            access_token: accessToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Instagram user profile error:", error);
      throw error;
    }
  }

  // Get user's Instagram media (posts/reels)
  async getUserMedia(accessToken, limit = 25) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.apiVersion}/me/media`,
        {
          params: {
            fields:
              "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
            access_token: accessToken,
            limit: limit,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Instagram user media error:", error);
      throw error;
    }
  }

  // Get detailed media information
  async getMediaDetails(mediaId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.apiVersion}/${mediaId}`,
        {
          params: {
            fields:
              "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url}",
            access_token: accessToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Instagram media details error:", error);
      throw error;
    }
  }

  // Extract Instagram post/reel ID from URL
  extractMediaId(url) {
    const patterns = [
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Get media by URL
  async getMediaByUrl(url, accessToken) {
    try {
      const mediaId = this.extractMediaId(url);
      if (!mediaId) {
        throw new Error("Invalid Instagram URL");
      }

      return await this.getMediaDetails(mediaId, accessToken);
    } catch (error) {
      console.error("Instagram media by URL error:", error);
      throw error;
    }
  }

  // Process media data for IP asset creation
  processMediaForIPAsset(mediaData, username) {
    if (!mediaData) return null;

    return {
      title: mediaData.caption
        ? mediaData.caption.substring(0, 100)
        : `Instagram ${mediaData.media_type}`,
      description: mediaData.caption || "",
      sourceUrl: mediaData.permalink,
      sourcePlatform: "instagram",
      thumbnailUrl: mediaData.thumbnail_url || mediaData.media_url,
      duration: null, // Instagram doesn't provide duration for static posts
      fileSize: null, // Instagram doesn't provide file size
      contentHash: null, // Will be generated later
      audioFingerprint: null, // Will be generated later
      visualFingerprint: null, // Will be generated later
      metadata: {
        mediaId: mediaData.id,
        username: username,
        mediaType: mediaData.media_type,
        publishedAt: mediaData.timestamp,
        permalink: mediaData.permalink,
        mediaUrl: mediaData.media_url,
        thumbnailUrl: mediaData.thumbnail_url,
        children: mediaData.children || [],
      },
    };
  }

  // Check if media is already registered
  async checkMediaRegistration(mediaUrl, accessToken) {
    try {
      const mediaData = await this.getMediaByUrl(mediaUrl, accessToken);
      return {
        exists: !!mediaData,
        mediaData: mediaData ? this.processMediaForIPAsset(mediaData) : null,
      };
    } catch (error) {
      console.error("Instagram media registration check error:", error);
      throw error;
    }
  }

  // Get Instagram OAuth URL for authorization
  getOAuthUrl(clientId, redirectUri, state) {
    const scopes = ["user_profile", "user_media"].join(",");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
      state: state,
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(clientId, clientSecret, redirectUri, code) {
    try {
      const response = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code: code,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Instagram token exchange error:", error);
      throw error;
    }
  }

  // Get long-lived access token
  async getLongLivedToken(accessToken, clientSecret) {
    try {
      const response = await axios.get(`${this.baseURL}/access_token`, {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: clientSecret,
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Instagram long-lived token error:", error);
      throw error;
    }
  }
}

module.exports = new InstagramService();
