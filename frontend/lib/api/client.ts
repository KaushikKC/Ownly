import axios, { AxiosInstance, AxiosResponse } from "axios";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuthToken();
          window.location.href = "/";
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  // Auth endpoints
  async registerUser(userData: {
    email: string;
    name: string;
    profilePicture?: string;
    googleId?: string;
    walletAddress?: string;
  }) {
    const response = await this.client.post("/auth/register", userData);
    if (response.data.success && response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  async updateUserProfile(profileData: {
    walletAddress?: string;
    instagramHandle?: string;
    youtubeChannelId?: string;
    preferences?: any;
  }) {
    const response = await this.client.put("/auth/me", profileData);
    return response.data;
  }

  async verifyToken() {
    const response = await this.client.get("/auth/verify");
    return response.data;
  }

  // IP Assets endpoints
  async getMyAssets() {
    const response = await this.client.get("/ip-assets/my-assets");
    return response.data;
  }

  async getAllAssets(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get("/ip-assets", { params });
    return response.data;
  }

  async createIPAsset(assetData: {
    title: string;
    description?: string;
    sourceUrl: string;
    sourcePlatform: string;
    thumbnailUrl?: string;
    duration?: number;
    fileSize?: number;
    contentHash?: string;
    audioFingerprint?: string;
    visualFingerprint?: string;
    collaborators?: any[];
    license?: any;
  }) {
    const response = await this.client.post("/ip-assets", assetData);
    return response.data;
  }

  async getIPAsset(id: string) {
    const response = await this.client.get(`/ip-assets/${id}`);
    return response.data;
  }

  async updateIPAsset(id: string, assetData: any) {
    const response = await this.client.put(`/ip-assets/${id}`, assetData);
    return response.data;
  }

  async checkURL(sourceUrl: string) {
    const response = await this.client.post("/ip-assets/check-url", {
      sourceUrl,
    });
    return response.data;
  }

  // YouTube endpoints
  async getYouTubeChannel(accessToken: string) {
    const response = await this.client.get("/youtube/channel", {
      data: { accessToken },
    });
    return response.data;
  }

  async getYouTubeVideos(accessToken: string, maxResults = 50) {
    const response = await this.client.get("/youtube/videos", {
      data: { accessToken, maxResults },
    });
    return response.data;
  }

  async getYouTubeVideoDetails(videoId: string) {
    const response = await this.client.get(`/youtube/video/${videoId}`);
    return response.data;
  }

  async checkYouTubeVideo(videoUrl: string) {
    const response = await this.client.post("/youtube/check-video", {
      videoUrl,
    });
    return response.data;
  }

  async verifyYouTubeOwnership(videoUrl: string, userEmail: string) {
    const response = await this.client.post("/youtube/verify-ownership", {
      videoUrl,
      userEmail,
    });
    return response.data;
  }

  async linkYouTubeChannel(accessToken: string) {
    const response = await this.client.post("/auth/youtube-channel", {
      accessToken,
    });
    return response.data;
  }

  async registerYouTubeVideo(data: {
    videoUrl: string;
    accessToken: string;
    collaborators?: any[];
    license?: any;
  }) {
    const response = await this.client.post("/youtube/register-video", data);
    return response.data;
  }

  async bulkRegisterYouTubeVideos(data: {
    accessToken: string;
    maxResults?: number;
    collaborators?: any[];
    license?: any;
  }) {
    const response = await this.client.post("/youtube/bulk-register", data);
    return response.data;
  }

  // Instagram endpoints
  async getInstagramOAuthUrl(state?: string) {
    const response = await this.client.get("/instagram/oauth-url", {
      params: { state },
    });
    return response.data;
  }

  async exchangeInstagramCode(code: string, state?: string) {
    const response = await this.client.post("/instagram/oauth/callback", {
      code,
      state,
    });
    return response.data;
  }

  async getInstagramProfile(accessToken: string) {
    const response = await this.client.get("/instagram/profile", {
      data: { accessToken },
    });
    return response.data;
  }

  async getInstagramMedia(accessToken: string, limit = 25) {
    const response = await this.client.get("/instagram/media", {
      data: { accessToken, limit },
    });
    return response.data;
  }

  async checkInstagramMedia(mediaUrl: string, accessToken: string) {
    const response = await this.client.post("/instagram/check-media", {
      mediaUrl,
      accessToken,
    });
    return response.data;
  }

  async registerInstagramMedia(data: {
    mediaUrl: string;
    accessToken: string;
    collaborators?: any[];
    license?: any;
  }) {
    const response = await this.client.post("/instagram/register-media", data);
    return response.data;
  }

  async bulkRegisterInstagramMedia(data: {
    accessToken: string;
    limit?: number;
    collaborators?: any[];
    license?: any;
  }) {
    const response = await this.client.post("/instagram/bulk-register", data);
    return response.data;
  }

  // Collaborators endpoints
  async getCollaborators(assetId: string) {
    const response = await this.client.get(`/collaborators/${assetId}`);
    return response.data;
  }

  async addCollaborator(
    assetId: string,
    collaboratorData: {
      userId: string;
      walletAddress: string;
      ownershipPercentage: number;
      role?: string;
    }
  ) {
    const response = await this.client.post(
      `/collaborators/${assetId}`,
      collaboratorData
    );
    return response.data;
  }

  async updateCollaborator(
    assetId: string,
    collaboratorId: string,
    data: {
      approved?: boolean;
      ownershipPercentage?: number;
    }
  ) {
    const response = await this.client.put(
      `/collaborators/${assetId}/${collaboratorId}`,
      data
    );
    return response.data;
  }

  async removeCollaborator(assetId: string, collaboratorId: string) {
    const response = await this.client.delete(
      `/collaborators/${assetId}/${collaboratorId}`
    );
    return response.data;
  }

  // Users endpoints
  async searchUsers(query: string, page = 1, limit = 10) {
    const response = await this.client.get("/users", {
      params: { q: query, page, limit },
    });
    return response.data;
  }

  async getUserProfile(userId: string) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async getUserStats(userId: string) {
    const response = await this.client.get(`/users/${userId}/stats`);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get("/health");
    return response.data;
  }
}

// Create singleton instance
const apiClient = new ApiClient();
export default apiClient;
