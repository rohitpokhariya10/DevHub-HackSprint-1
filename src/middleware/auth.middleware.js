const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");

const authMiddleware = async (req, res, next) => {
  try {
    // Read the access token sent by the client in cookies.
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new ApiError(401, "Access token not found");
    }

    // Verify the JWT and extract the payload for identifying the user.
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });

    if (!decoded || !decoded.id) {
      throw new ApiError(401, "Invalid access token");
    }

    // Fetch the authenticated user without sensitive credential fields.
    const user = await User.findById(decoded.id).select(
      "-passwordHash -refreshTokenHash",
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Make the user available to the next middleware or controller.
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
