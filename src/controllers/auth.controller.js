const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const { hashFunction, comparePassword } = require("../utils/hashPaassword");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

// Registers a local account, creates its profile shell, and starts an authenticated session.
const registerController = async (req, res) => {
  let { email, name, password } = req.body;

  if (!email || !name || !password) {
    throw new ApiError(400, "All fields are required");
  }

  let isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new ApiError(409, "User already Exist");
  }

  // Store only the password hash so raw credentials never reach the database.
  let passwordHash = await hashFunction(password);
  let newUser = await User.create({
    name,
    passwordHash,
    email,
    isEmailVerified: true,
  });
  
  //So that we can link user and profile
  await Profile.create({
    user:newUser._id
  })

  // Refresh tokens are hashed at rest to reduce impact if the database is exposed.
  let accessToken = generateAccessToken(newUser._id);
  let refreshToken = generateRefreshToken(newUser._id);
  let refreshTokenHash = await hashFunction(refreshToken);
  newUser.refreshTokenHash = refreshTokenHash;
  await newUser.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  return res.status(201).json({
    message: "User registered successfully",
  });
};

// Authenticates a local user and rotates the refresh token for the new session.
const loginController = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  email = email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  console.log(password, user.passwordHash);
  const isPasswordCorrect = await comparePassword(password, user.passwordHash);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const refreshTokenHash = await hashFunction(refreshToken);

  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
  });
};

// Lightweight protected endpoint used by clients to verify the current session.
const getMeController = async (req, res) => {
  return res.status(200).json({
    message: "Successfully reached here",
  });
};

// Completes Google OAuth login and issues the same cookie-based session as local auth.
const googleCallback = async (req, res) => {
  let user = req.user;
  console.log("user-->", user);
  const accessToken = await generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);
  let refreshTokenHash = await hashFunction(refreshToken);

  await User.findOneAndUpdate(user._id , {refreshTokenHash});

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({
    message: "Google Loggedin successfully",
  });
};
module.exports = {
  registerController,
  loginController,
  getMeController,
  googleCallback,
};
