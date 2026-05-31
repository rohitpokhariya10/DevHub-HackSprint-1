const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  getMyProfileController,
  updateMyProfileController,
  getPublicProfileController,
  updateProfilePictureController,
  updateBannerController,
  searchProfilesController,
} = require("../controllers/profile.controller");
const upload = require("../middleware/multer.middleware");

const profileRouter = express.Router();

// Profile routes keep private self-management and public profile discovery together.
// logged-in user can read own profile
profileRouter.get("/me", authMiddleware, getMyProfileController);
// logged-in user can update own profile
profileRouter.patch("/me", authMiddleware, updateMyProfileController);
// Upload middleware reads the file into memory before ImageKit persistence happens.
//These 2 routes are for uploading/updating the logged-in user’s profile picture and banner image.
profileRouter.patch(
  "/me/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfilePictureController,
);
profileRouter.patch("/me/banner", authMiddleware, upload.single("banner"),updateBannerController);
//search user profile on the bsis of skills , techstack , location etc
profileRouter.get("/search" , searchProfilesController);
// Public developer profile
profileRouter.get("/:name", getPublicProfileController);
module.exports = profileRouter;
