const mongoose = require("mongoose");

// Stores all developer-facing profile data separately from authentication details.
const profileSchema = new mongoose.Schema(
  {
    // One profile belongs to one user; unique keeps the relationship one-to-one.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Persist both the public URL and provider fileId so old assets can be deleted.
    profilePicture: {
      url: {
        type: String,
        default: "",
      },
      fileId: {
        type: String,
        default: "",
      },
    },

    // Banner follows the same ImageKit lifecycle as profile pictures.
    banner: {
      url: {
        type: String,
        default: "",
      },
      fileId: {
        type: String,
        default: "",
      },
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    techStack: [
      {
        type: String,
        trim: true,
      },
    ],

    // Optional public links used by profile pages and portfolio discovery.
    socialLinks: {
      github: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      portfolio: {
        type: String,
        default: "",
      },
      leetcode: {
        type: String,
        default: "",
      },
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    profileCompletion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
