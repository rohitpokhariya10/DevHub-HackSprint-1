const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const { hashFunction, comparePassword } = require("../utils/hashPaassword");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

//1.
const registerController = async (req, res) => {
  let { email, name, password } = req.body;

  if (!email || !name || !password) {
    throw new ApiError(400, "All fields are required");
  }

  let isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new ApiError(409, "User already Exist");
  }

  //
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

  //
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

//2.
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

//3.
const getMeController = async (req, res) => {
  return res.status(200).json({
    message: "Successfully reached here",
  });
};

//4.
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
