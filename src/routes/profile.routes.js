const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  getMyProfileController,
  updateMyProfileController,
  getPublicProfileController,
  updateProfilePictureController,
  updateBannerController,
} = require("../controllers/profile.controller");
const upload = require("../middleware/multer.middleware");

const profileRouter = express.Router();

// logged-in user can read own profile
profileRouter.get("/me", authMiddleware, getMyProfileController);
// logged-in user can update own profile
profileRouter.patch("/me", authMiddleware, updateMyProfileController);
// Public developer profile
profileRouter.get("/:name", getPublicProfileController);
//These 2 routes are for uploading/updating the logged-in user’s profile picture and banner image.
profileRouter.patch(
  "/me/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfilePictureController,
);


module.exports = profileRouter;
