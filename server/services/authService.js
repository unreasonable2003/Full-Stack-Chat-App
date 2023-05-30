const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
// const generateToken = require("../config/generateToken")
const Token = require("../models/tokenModel");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const clientURL = process.env.CLIENT_URL;
const bcryptSalt = process.env.BCRYPT_SALT;

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return false;
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;

  sendEmail(
    user.email,
    "Password Reset Request",
    {
      name: user.name,
      link: link,
    },
    "./template/requestResetPassword.handlebars"
  );
  return { link };
};

const resetPassword = async (userId, token, password) => {
  let passwordResetToken = await Token.findOne({ userId });
  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }
//   console.log(passwordResetToken.token, token);
  const hash = await bcrypt.hash(password, Number(bcryptSalt));
  console.log(hash);
  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );
  const user = await User.findById({ _id: userId });
  sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );
  await passwordResetToken.deleteOne();
  return true;
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
