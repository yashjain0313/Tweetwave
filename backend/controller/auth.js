const userSignUpSchema = require("../zod/types");
const userSignInSchema = require("../zod/types");
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const generateTokenAndSetCookie = require("../lib/utils/generateToken");
const crypto = require("crypto");
const sendEmail = require("../lib/utils/sendEmail");

const signup = async (req, res) => {
  try {
    //ZOD:
    const response = userSignUpSchema.safeParse(req.body);
    if (!response.success) {
      return res.status(411).json({
        message: "Wrong Input for Sigup",
      });
    }

    //USER EXISTS:
    const existUser = await User.findOne({ username: req.body.username });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    //EMAIL EXISTS:
    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exist" });
    }

    //HASHING PASSWORD:
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //CREATING USER:
    const newUser = await new User({
      fullname: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ message: "Error creating user" });
      return;
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const response = userSignInSchema.safeParse(req.body);
    if (!response.success) {
      res.status(411).json({
        message: "Wrong Input for Login",
      });
      return;
    }

    const user = await User.findOne({ username: req.body.username });
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    // Clear JWT cookie
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // Also clear any session cookies
    res.clearCookie("connect.sid");

    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in getMe route", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email, fullname, username, provider, googleId, profilePicture } =
      req.body;

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });

    // If user doesn't exist by Google ID, check by email
    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        // User exists with this email but not with Google auth, update for linking
        if (user.provider === "local") {
          user.provider = "google";
          user.googleId = googleId;
          // Update profile picture if not already set
          if (!user.profileImg && profilePicture) {
            user.profileImg = profilePicture;
          }
          await user.save();
        }
      } else {
        // Create new user if doesn't exist
        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        let uniqueUsername = username;

        // If username exists, append a random number to make it unique
        if (existingUsername) {
          uniqueUsername = `${username}${Math.floor(
            1000 + Math.random() * 9000
          )}`;
        }

        user = new User({
          fullname,
          username: uniqueUsername,
          email,
          provider: "google",
          googleId,
          profileImg: profilePicture || "",
        });

        await user.save();
      }
    }

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Return user data
    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      provider: user.provider,
    });
  } catch (error) {
    console.log("Error in Google login:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account with that email exists" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (10 minutes)
    const otpExpiration = Date.now() + 10 * 60 * 1000;

    // Save OTP to user record
    user.otp = otp;
    user.otpExpires = otpExpiration;
    await user.save();

    // Send OTP via email
    const subject = "TweetWave Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}. This code will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1DA1F2;">TweetWave Password Reset</h2>
        <p>Hello ${user.fullname},</p>
        <p>You requested to reset your password. Please use the following One-Time Password (OTP) to verify your identity:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email or contact support.</p>
        <p>Thank you,<br>TweetWave Team</p>
      </div>
    `;

    try {
      await sendEmail(user.email, subject, text, html);
      res.status(200).json({
        message: "OTP has been sent to your email",
        email: user.email,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res
        .status(500)
        .json({ message: "Failed to send OTP email. Please try again later." });
    }
  } catch (error) {
    console.log("Error in forgot password controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user with the email
    const user = await User.findOne({
      email,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found or OTP expired" });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Generate reset token for the next step (setting new password)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Hash token before saving to database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token and clear OTP
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = resetTokenExpiration;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.log("Error in verify OTP controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Hash the token from the request to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user with new password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate token and log the user in
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      message: "Password reset successful",
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.log("Error in reset password controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  googleLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
