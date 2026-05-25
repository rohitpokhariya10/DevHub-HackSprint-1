const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  registerController,
  loginController,
  getMeController,
  googleCallback,
} = require("../controllers/auth.controller");
const passport = require("../config/passport");

const authRouter = express.Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/get-me", authMiddleware, getMeController); //Protected route

//Google authentication routes
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
//
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback
);

module.exports = authRouter;
