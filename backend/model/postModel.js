const { default: mongoose } = require("mongoose");
const moongoose = require("mongoose");

const postSchema = new moongoose.Schema({
    user: {
        type: moongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
    },
    img: {
        type: String,
    },
    likes: [
        {
            type: moongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    comments: [
        {
            text: {
                type: String,
                required: true
            },
            user: {
                type: moongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        },
    ]
},{timestamps: true});



const Post = mongoose.model("Post", postSchema);

module.exports = Post;