const mongoose = require("mongoose");

const collaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  ownershipPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["creator", "collaborator", "licensor"],
    default: "collaborator",
  },
});

const licenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["commercial", "non-commercial", "derivative", "exclusive"],
    required: true,
  },
  royaltyPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  terms: {
    type: String,
  },
  duration: {
    type: String, // e.g., "1 year", "perpetual"
  },
});

const ipAssetSchema = new mongoose.Schema({
  // Basic information
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },

  // Content source
  sourceUrl: {
    type: String,
    required: true,
  },
  sourcePlatform: {
    type: String,
    enum: ["youtube", "instagram", "tiktok", "other"],
    required: true,
  },

  // Content metadata
  thumbnailUrl: {
    type: String,
  },
  duration: {
    type: Number, // in seconds
  },
  fileSize: {
    type: Number, // in bytes
  },

  // Content fingerprinting
  contentHash: {
    type: String, // SHA-256 hash of content
  },
  audioFingerprint: {
    type: String,
  },
  visualFingerprint: {
    type: String,
  },

  // Ownership and collaboration
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collaborators: [collaboratorSchema],

  // Licensing
  license: licenseSchema,

  // Blockchain integration
  nftTokenId: {
    type: String,
  },
  nftContractAddress: {
    type: String,
  },
  storyProtocolAssetId: {
    type: String,
  },

  // Status
  status: {
    type: String,
    enum: ["draft", "pending", "registered", "rejected", "disputed"],
    default: "draft",
  },

  // Disputes
  disputes: [
    {
      assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IPAsset",
      },
      claimantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      claimantAddress: {
        type: String,
      },
      disputeReason: {
        type: String,
      },
      storyProtocolDisputeId: {
        type: String,
      },
      transactionHash: {
        type: String,
      },
      status: {
        type: String,
        enum: ["pending", "resolved", "rejected"],
        default: "pending",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      resolvedAt: {
        type: Date,
      },
    },
  ],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  registeredAt: {
    type: Date,
  },
});

// Update the updatedAt field on save
ipAssetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
ipAssetSchema.index({ sourceUrl: 1 });
ipAssetSchema.index({ owner: 1 });
ipAssetSchema.index({ status: 1 });
ipAssetSchema.index({ createdAt: -1 });

module.exports = mongoose.model("IPAsset", ipAssetSchema);
