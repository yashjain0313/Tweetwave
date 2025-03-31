const userSignUpSchema = require("../zod/types");
const userSignInSchema = require("../zod/types");
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const generateTokenAndSetCookie = require("../lib/utils/generateToken");

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
    res.cookie("jwt", "", { maxAge: 0 });
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

module.exports = {
  signup,
  login,
  logout,
  getMe,
  googleLogin,
};
