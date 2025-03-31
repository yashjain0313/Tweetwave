const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const { createPost, deletePost, commentOnPost, likeUnLikeOnPost, getAllPosts, getAllLikePosts, getAllFollowingPosts, getAnyUserPosts } = require("../controller/post");
const postRouter = express.Router();


postRouter.get('/all', protectRoute, getAllPosts)
postRouter.get('/following', protectRoute, getAllFollowingPosts)
postRouter.get('/user/:username', protectRoute, getAnyUserPosts);
postRouter.get('/likes/:id', protectRoute, getAllLikePosts);
postRouter.post("/create", protectRoute, createPost);
postRouter.put("/like/:id", protectRoute, likeUnLikeOnPost);
postRouter.put("/comment/:id", protectRoute, commentOnPost)
postRouter.delete("/:id", protectRoute, deletePost);

module.exports = postRouter