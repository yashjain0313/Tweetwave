const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({message: "No token, authorization denied"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: "Token is not valid"});
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectedRoute middleware", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

module.exports = protectRoute;