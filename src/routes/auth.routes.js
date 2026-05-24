const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  registerController,
  loginController,
  getMeController,
} = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/get-me", authMiddleware, getMeController); //Protected route

module.exports = authRouter;
