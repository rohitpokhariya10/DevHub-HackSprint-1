const express = require("express");
const { createProjectController } = require("../controllers/project.controller");
const authMiddleware = require("../middleware/auth.middleware");
const projectRouter = express.Router();
const upload = require("../middleware/multer.middleware")



projectRouter.post("/create" , authMiddleware , upload.single("thumbnail") ,createProjectController);









module.exports = projectRouter;