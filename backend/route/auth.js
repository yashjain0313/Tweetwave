const express = require("express");
const {
  signup,
  login,
  logout,
  getMe,
  googleLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controller/auth");
const protectRoute = require("../middleware/protectRoute");

const authRouter = express.Router();

authRouter.get("/me", protectRoute, getMe);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/google-login", googleLogin);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

module.exports = authRouter;
