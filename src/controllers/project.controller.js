const Project = require("../models/project.model");
const ApiError = require("../utils/apiError");
const uploadToImageKit = require("../utils/imageKitUtils");

const createProjectController = async (req, res) => {
  let { title, shortDescription, description, githubUrl, liveUrl } = req.body;
  let { id } = req.user;
  let techStack = req.body.techStack;

  let file = req.file;
  // console.log("file-->", file);
  if (!file) {
    throw new ApiError(400, "Project thumbnail is required");
  }

  if (!title) {
    throw new ApiError(401, "Project title is required");
  }
  if (!shortDescription) {
    throw new ApiError(401, "Short description is required");
  }
  if (!description) {
    throw new ApiError(401, "description is required");
  }
  // If techStack comes as string from form-data: "react,node,express"
  if (typeof techStack === "string") {
    techStack = techStack
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean);
  }

  // If techStack not provided
  if (!techStack) {
    techStack = [];
  }

  let githubURL = githubUrl;
  let liveURL = liveUrl;
  const thumbnail = await uploadToImageKit(
    file.buffer,
    `${Date.now()}-${file.fieldname}`,
    "/devHub/projectThumbnail",
  );

  //console.log("thumbnail--->", thumbnail);

  let newProject = await Project.create({
    title,
    description,
    shortDescription,
    githubUrl: githubURL,
    liveUrl: liveURL,
    thumbnail: thumbnail,
    user: id,
    techStack: techStack,
  });

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    newProject,
  });
};

const getMyProjectController = async (req, res) => {
  let { id } = req.user;
  console.log("owner of the project-->", id);
  if (!id) {
    throw new ApiError(401, "Unauthorized access");
  }
  let myProjects = await Project.find({ user: id });
  console.log("myProjects-->", myProjects);
  return res.status(200).json({
    message: "Project fetched successfully",
    success: true,
    myProjects,
  });
};
module.exports = { createProjectController, getMyProjectController };
