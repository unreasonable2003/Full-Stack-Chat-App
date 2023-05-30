const express = require("express");
const {
  registerUser,
  authUser,
  resetPasswordController,
  resetPasswordRequestController,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").post(registerUser);
router.post("/login", authUser);
router.post("/requestResetPassword", resetPasswordRequestController);
router.post("/resetPassword", resetPasswordController);

module.exports = router;
