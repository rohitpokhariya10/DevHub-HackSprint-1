const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    techStack: [
      {
        type: String,
        trim: true,
      },
    ],

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    liveUrl: {
      type: String,
      trim: true,
      default: "",
    },

    thumbnail: {
      url: {
        type: String,
        default: "",
      },
      fileId: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },

    views: {
      type: Number,
      default: 0,
    },
    viewedBy:[
     {
      type:String,
     }

    ]
,
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
