const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getMyProfileController, updateMyProfileController } = require("../controllers/profile.controller");


const profileRouter = express.Router();


profileRouter.get("/me" , authMiddleware , getMyProfileController );
profileRouter.patch("/me" , authMiddleware , updateMyProfileController);
// profileRouter.patch("/me" , authMiddleware);

module.exports = profileRouter;