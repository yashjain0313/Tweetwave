const express = require("express");
const {
  signup,
  login,
  logout,
  getMe,
  googleLogin,
} = require("../controller/auth");
const protectRoute = require("../middleware/protectRoute");

const authRouter = express.Router();

authRouter.get("/me", protectRoute, getMe);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/google-login", googleLogin);

module.exports = authRouter;
