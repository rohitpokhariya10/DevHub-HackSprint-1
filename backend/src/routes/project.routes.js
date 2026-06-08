const express = require("express");
const { createProjectController, getMyProjectController, getUserProjectsController, getSingleProjectByIdController, deleteProjectController, updateProjectController } = require("../controllers/project.controller");
const authMiddleware = require("../middleware/auth.middleware");
const projectRouter = express.Router();
const upload = require("../middleware/multer.middleware")



projectRouter.post("/create" , authMiddleware , upload.single("thumbnail") ,createProjectController);
projectRouter.get("/me" , authMiddleware , getMyProjectController);
projectRouter.get("/user/:name" , getUserProjectsController);
projectRouter.get("/:projectId" , authMiddleware  ,getSingleProjectByIdController);
projectRouter.delete("/:projectId" , authMiddleware , deleteProjectController);
projectRouter.patch("/:projectId" , authMiddleware , upload.single("thumbnail") ,updateProjectController );





module.exports = projectRouter;