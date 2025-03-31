const User = require('../model/userModel');
const Post = require('../model/postModel');
const Notification = require('../model/notification')
const { v2 } = require('cloudinary');

const createPost = async (req,res)=>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if(!user){ return res.status(404).json({message: "User not found"})}
        if(!text && !img){
            return res.status(400).json({message: "Text or image is required"});
        }

        if(img){
            const uploadRes = await v2.uploader.upload(img)
            img = uploadRes.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        })
        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
        console.log("Error while creating a post: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const deletePost = async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        if(post.user.toString()!== req.user._id.toString()){
            return res.status(401).json({error: "You are not authorized to delete this post"})
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await v2.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({msg: "Post deleted successfully"});
    } catch (error) {
        console.log("Error while deleting a post: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const commentOnPost = async (req,res)=>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({message: "Text is required"});
        }
        const post = await Post.findById(postId)

        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        const comment = {
            user: userId,
            text
        }
        post.comments.push(comment);
        await post.save();

        const updatedComment = await Post.findById(postId).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(updatedComment.comments);

    } catch (error) {
        console.log("Error while posting a comment: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const likeUnLikeOnPost = async (req,res)=>{
    try {
        const userId = req.user.id;
        const {id: postId} = req.params;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        const isLiked = post.likes.includes(userId);
        if(isLiked){
            //Unlike
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});

            // return res.status(200).json({msg: "Post unliked successfully"})

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            return res.status(200).json(updatedLikes);
        }else{
            //like
            post.likes.push(userId);
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save();

            // res.status(200).json({msg: "Post liked successfully"});
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }

    } catch (error) {
        console.log("Error while liking or unliking a post: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const getAllPosts = async (req,res)=>{
    try {
        // const posts = await Post.find().sort({createdAt: -1}); // only give us userId not it's details
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        })   //give user details of person who wrote the post without including their password
        .populate({
            path: "comments.user",
            select: "-password"
        })                 //commented person details
        .populate({
            path: "likes",
            select: "-password"
        })                //liked person details
        if(posts.length === 0){
            return res.status(200).json([]);
        }
        res.status(200).json(posts);

    } catch (error) {
        console.log("Error while getting all posts: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const getAllLikePosts = async (req,res)=>{
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){ return res.status(404).json({message: "User not found"});}

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error while getting all liked posts: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const getAllFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if(!user){ return res.status(404).json({message: "User not found"}) }

        const following = user.following;
        const findPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(findPosts);

    } catch (error) {
        console.log("Error while getting all following posts: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const getAnyUserPosts = async (req,res)=>{
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if(!user){return res.status(404).json({message: "User not found"});}

        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error while getting user posts: ",error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

module.exports = {
    createPost,
    deletePost,
    commentOnPost,
    likeUnLikeOnPost,
    getAllPosts,
    getAllLikePosts,
    getAllFollowingPosts,
    getAnyUserPosts
}