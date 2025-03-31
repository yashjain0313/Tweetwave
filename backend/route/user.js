const express = require('express');
const protectRoute = require("../middleware/protectRoute");
const { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUserProfile } = require('../controller/user');
const userRouter = express.Router();

userRouter.get('/profile/:username',protectRoute, getUserProfile);
userRouter.get('/suggested',protectRoute, getSuggestedUsers);
userRouter.post('/follow/:id',protectRoute, followUnfollowUser);
userRouter.put('/update',protectRoute, updateUserProfile);


module.exports = userRouter;