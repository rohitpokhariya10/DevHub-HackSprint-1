const Project = require("../models/project.model");
const User = require("../models/user.model");
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

const getSingleProjectByIdController = async (req, res) => {
  const { projectId } = req.params;
  console.log("Project id-->" , projectId)
  if (!projectId) {
    throw new ApiError(401, "Unauthorized access");
  }
  let project = await Project.findById(projectId);
  console.log("This is the searched Prooject-->", project);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return res.status(200).json({
    message:"Project fetched successfully",
    success:true,
    project
  })
};

const deleteProjectController = async (req , res)=>{
  let {projectId} = req.params;
  if(!projectId){
    throw new ApiError(401, "Unauthorized access");
  }

  let deletedProject = await Project.findByIdAndDelete(projectId);
  //console.log("deleted Project-->" , deletedProject);
  return res.status(200).json({
    message:"Project deleted successfully",
    success:true
  })
}
module.exports = {
  createProjectController,
  getMyProjectController,
  getUserProjectsController,
  getSingleProjectByIdController,
  deleteProjectController
};
