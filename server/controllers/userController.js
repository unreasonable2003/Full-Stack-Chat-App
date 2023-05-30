const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
// const Token = require("../models/tokenModel");
// const bcrypt = require("bcrypt");
// const sendEmail = require("../utils/email/sendEmail");
const {
  requestPasswordReset,
  resetPassword,
} = require("../services/authService");

// const clientURL = process.env.CLIENT_URL;
// const bcryptSalt = process.env.BCRYPT_SALT;

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create User");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const resetPasswordRequestController = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    const requestPasswordResetService = await requestPasswordReset(email);
    if (!requestPasswordResetService) {
      res.status(401);
      throw new Error("Email does not exist");
    }
  
    return res.json(requestPasswordResetService);
  });
  
  const resetPasswordController = asyncHandler(async (req, res) => {
    const {userId,token,password} = req.body;
    const resetPasswordService = await resetPassword(
      userId,
      token,
      password,
    );
  
    return res.json(resetPasswordService);
  });

module.exports = {
  registerUser,
  authUser,
  resetPasswordRequestController,
  resetPasswordController,
};
