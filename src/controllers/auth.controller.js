const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const {hashFunction , comparePassword} = require("../utils/hashPaassword");
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

  //
  let accessToken = generateAccessToken(newUser._id);
  let refreshToken = generateRefreshToken(newUser._id);
  let refreshTokenHash = await hashFunction(refreshToken);
  newUser.refreshTokenHash = refreshTokenHash;
  await newUser.save();

  res.cookie("accesToken", accessToken, {
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
   console.log(password , user.passwordHash);
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
const getMeController = async (req , res)=>{
    return res.status(200).json({
        message:"Successfully reached here"
    })

}
module.exports = { registerController, loginController , getMeController};
