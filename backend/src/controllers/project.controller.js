const { default: mongoose } = require("mongoose");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const uploadToImageKit = require("../utils/imageKitUtils");

/**
 * Creates a project owned by the authenticated user.
 * Validates required metadata, normalizes the technology stack, uploads the
 * thumbnail, and persists the resulting project document.
 */
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
  // Upload the thumbnail before persistence so the stored project references the hosted asset.
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

/**
 * Returns all projects created by the currently authenticated user.
 */
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

/**
 * Returns the public project collection for the user identified by name.
 */
const getUserProjectsController = async (req, res) => {
  let { name } = req.params;
  if (!name) {
    throw new ApiError(400, "Username is required for search");
  }

  let user = await User.findOne({ name });
  console.log("I want to see this User Projects-->", user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  let projects = await Project.find({ user: user._id });
  console.log("projects-->", projects);
  return res.status(200).json({
    success: false,
    message: "User project fetched successfully",
    projects,
  });
};

/**
 * Fetches a project by id and records a unique view for the authenticated user.
 */
const getSingleProjectByIdController = async (req, res) => {
  const { projectId } = req.params;
  console.log("Project id-->", projectId);
  const userId = req.user._id;
  console.log("userId-->", userId);
  if (!projectId) {
    throw new ApiError(400, "Project id is required");
  }
  let project = null;
  // Count at most one view per authenticated user while retaining the viewer reference.
  if (userId) {
    project = await Project.findOneAndUpdate(
      { _id: projectId, viewedBy: { $ne: userId } },
      { $inc: { views: 1 }, $addToSet: { viewedBy: userId } },
      { new: true },
    );
  }
  project = await Project.findById(projectId);
  console.log("This is the searched Prooject-->", project);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res.status(200).json({
    message: "Project fetched successfully",
    success: true,
    project,
  });
};

/**
 * Deletes a project after confirming that the authenticated user owns it.
 */
const deleteProjectController = async (req, res) => {
  let { projectId } = req.params;
  let { id } = req.user;
  //console.log("user id jo project delete krega-->" , id);
  if (!projectId) {
    throw new ApiError(401, "Unauthorized access");
  }

  let project = await Project.findById(projectId);
  //console.log("project-->" , project);

  console.log(id, project.user.toString());
  //owner ship check
  if (id !== project.user.toString()) {
    throw new ApiError(401, "Unauthorized access");
  }

  await Project.deleteOne(project);

  //let deletedProject = await Project.findByIdAndDelete(projectId);
  console.log("deleted Project-->", project);
  return res.status(200).json({
    message: "Project deleted successfully",
    success: true,
    deletedProject: project,
  });
};

/**
 * Updates an existing project after validating ownership and required fields.
 * Replaces the thumbnail with the newly uploaded asset before saving changes.
 */
const updateProjectController = async (req, res) => {
  let { projectId } = req.params;
  let { title, shortDescription, description, githubUrl, liveUrl } = req.body;
  let { techStack } = req.body;
  let userId = req.user._id;
  let file = req.file;
  console.log("file-->" , file);

  if (!projectId) {
    throw new ApiError(403, "Unauthorized access");
  }
  if (!title) {
    throw new ApiError(400, "Title is required");
  }
  if (!shortDescription) {
    throw new ApiError(400, "Shortdescription is required");
  }
  if (!description) {
    throw new ApiError(400, "Description is required");
  }
  let project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Prject not found");
  }
  if (userId != project.user.toString()) {
    throw new ApiError(401, "Unauthorized access");
  }
  // De-duplicate technology values while preserving the first occurrence order.
  if (techStack != undefined) {
    project.techStack = [
      ...new Set(
        techStack
          .trim()
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
      ),
    ];
  }
  let thumbnail = await uploadToImageKit(file.buffer, `${Date.now()} - ${file.fieldname}` , "/devHub/projectThumbnail")
  //console.log("thumbnail-->" , thumbnail);
  project.title = title;
  project.shortDescription = shortDescription;
  project.description = description;
  project.githubUrl = githubUrl;
  project.liveUrl = liveUrl;
  project.thumbnail = thumbnail;

  await project.save();

  return res.status(200).json({
    message: "Project updated successfully",
    success: true,
    updatedProject: project,
  });
};
module.exports = {
  createProjectController,
  getMyProjectController,
  getUserProjectsController,
  getSingleProjectByIdController,
  deleteProjectController,
  updateProjectController,
};
