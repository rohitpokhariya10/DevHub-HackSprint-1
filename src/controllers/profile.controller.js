const imagekit = require("../config/imagekit");
const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const uploadToImageKit = require("../utils/imageKitUtils");

// Returns the authenticated user's profile with safe user fields attached.
const getMyProfileController = async (req, res) => {
  console.log("user", req.user);
  //findOne --> Find the document in the Profile collection whose "user" field value is equal to req.user._id.
  let profile = await Profile.findOne({ user: req.user._id }).populate(
    "user",
    "name email",
  );
  console.log("profile-->", profile);
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  return res.status(200).json({
    message: "User fetched successfully",
    profile,
  });
};

// Applies partial profile updates while normalizing list fields for consistent storage.
const updateMyProfileController = async (req, res) => {
  let { headline, bio, techStack, socialLinks, skills, location } = req.body;

  let updateData = {};
  if (headline !== undefined) updateData.headline = headline;
  if (bio !== undefined) updateData.bio = bio;
  if (location !== undefined) updateData.location = location;
  if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      throw new ApiError(400, "Skill must be an array");
    }
    //filter(Boolean) removes falsy value from an array
    let Skills = [
      ...new Set(
        skills
          .filter(Boolean)
          .map((skill) => skill.trim())
          .filter(Boolean),
      ),
    ];
    updateData.skills = Skills;
    console.log("skills", Skills);
  }

  if (techStack !== undefined) {
    if (!Array.isArray(techStack)) {
      throw new ApiError(400, "techStack must be an array");
    }
    //filter(Boolean) removes falsy value from an array
    let TechStack = [
      ...new Set(
        techStack
          .filter(Boolean)
          .map((ts) => ts.trim())
          .filter(Boolean),
      ),
    ];
    updateData.techStack = TechStack;
    console.log("TechStack", TechStack);
  }

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    updateData,
    {
      new: true,
      runValidators: true,
      upsert: true, //If the data exists, update it; otherwise, create a new one.
    },
  ).populate("user", "name  email");

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return res.status(200).json({
    message: "Profile updated successfully",
    success: true,
    profile,
  });
};

// Public lookup endpoint for rendering a developer profile by username.
const getPublicProfileController = async (req, res) => {
  console.log("req.params-->", req.params);
  let { name } = req.params;

  let foundUser = await User.findOne({ name }).select("name email");
  if (!foundUser) {
    throw new ApiError(404, "User not found");
  }
  let profile = await Profile.findOne({ user: foundUser._id }).populate(
    "user",
    "name email",
  );
  console.log("profile-->", profile);
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  return res.status(200).json({
    message: "Public Profile fetched successfully",
    success: true,
    profile,
  });
};

// Replaces the logged-in user's profile image and removes the previous ImageKit file.
const updateProfilePictureController = async (req, res) => {
  console.log("req.file-->", req.file);
  if (!req.file) {
    throw new ApiError(400, "Profile picture is required");
  }
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw new ApiError(400, "Only JPEG, PNG, JPG and WEBP images are allowed");
  }

  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  // Delete old profile picture from ImageKit if exists
  if (profile.profilePicture?.fileId) {
    try {
      await imagekit.deleteFile(profile.profilePicture?.fileId);
     
    } catch (error) {
      console.log("Old profile picture delete failed:", error.message);
    }
  }
  const uploadImage = await uploadToImageKit(
    req.file.buffer,
    `profilePicture-${req.user.id}-${Date.now()}`,
    "/devHub/profilePicture",
  );
  console.log("uploadImage-->", uploadImage);

  profile.profilePicture = {
    url: uploadImage.url,
    fileId: uploadImage.fileId,
  };
  await profile.save();
  return res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    profile,
  });
};
const updateBannerController = async (req, res) => {
  console.log("req.file-->" , req.file);
  if(!req.file){
    throw new ApiError(404 , "Banner image is required");
  }
  const allowedMimeTypes = ["image/jpeg" , "image/webp" , "image/png" ,"image/jpg"];
  if(!allowedMimeTypes.includes(req.file.mimetype)){
      throw new ApiError(400, "Only JPEG, PNG, JPG and WEBP images are allowed");
  }

  const profile = await Profile.findOne({user : req.user._id});
    if (!profile) {
    throw new ApiError(404, "Profile not found");
  }
  console.log("profile-->" , profile);

  // Keep external storage clean by deleting the previous banner before saving a new one.
  if(profile.banner?.fileId){
    try{
      await imagekit.deleteFile(profile.banner.fileId)//deleteFile method only accept fielId
      console.log("banner deleted" , profile.banner.fileId)

    }
    catch(error){
       console.log("Old banner delete failed:", error.message);
    }
  }

   // ImageKit accepts base64 input here because multer keeps uploads in memory.
   const uploadedImage = await imagekit.upload({
    file: req.file.buffer.toString("base64"),
    fileName: `banner-${req.user._id}-${Date.now()}`,
    folder: "/devHub/banners",
  });
  console.log("uploadedImage-->" , uploadedImage);

  profile.banner ={
    url:uploadedImage.url,
    fileId:uploadedImage.fileId,
  }

  await profile.save();

  return res.status(200).json({
    message:"Banner upload successfully",
    profile
  })

};
module.exports = {
  getMyProfileController,
  updateMyProfileController,
  getPublicProfileController,
  updateProfilePictureController,
  updateBannerController,
};
