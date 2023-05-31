const express = require("express");
const {
  registerUser,
  authUser,
  resetPasswordController,
  resetPasswordRequestController,
  allUsers,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser);
router.route("/").get(protect, allUsers);
router.post("/login", authUser);
router.post("/requestResetPassword", resetPasswordRequestController);
router.post("/resetPassword", resetPasswordController);

module.exports = router;
