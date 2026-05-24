const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    avatar: {
      type: String,
      default: "https://ik.imagekit.io/uosvj5zwr3/pngtree-user-profile-icon-image-vector-png-image_12640450.png",
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokenHash: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

//

userSchema.post("save" , async function(){
//nodemailer call
});

let User = mongoose.model("User", userSchema);
module.exports = User;