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

// Local authentication endpoints issue httpOnly cookie-based sessions.
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/get-me", authMiddleware, getMeController); //Protected route

// Starts the Google OAuth consent flow without creating an Express session.
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
// Handles Google's callback, then delegates token issuing to the controller.
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback
);

module.exports = authRouter;
