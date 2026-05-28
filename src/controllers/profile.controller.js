const Profile = require("../models/profile.model");
const ApiError = require("../utils/apiError");

//
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

//
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
      ...new Set(skills.map((skill) => skill.trim()).filter(Boolean)),
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
      ...new Set(techStack.map((ts) => ts.trim()).filter(Boolean)),
    ];
    updateData.techStack = TechStack
    console.log("TechStack", TechStack);
  }

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).populate("user", "name , email");

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return res.status(200).json({
    message: "Profile updated successfully",
    success:true,
  });
};
module.exports = { getMyProfileController, updateMyProfileController };
