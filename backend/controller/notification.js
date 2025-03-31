const Notification = require("../model/notification")

const getNotifications = async (req,res)=>{
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({to: userId}).populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({to: userId}, {read: true});

        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error in getNotifications", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

const deleteNotifications = async (req,res)=>{
    try {
        const userId = req.user._id;

        await Notification.deleteMany({to: userId});

        const notifications = await Notification.find({to: userId}).populate({
            path: "from",
            select: "username profileImg"
        })

        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error in deleteNotifications", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}


module.exports = {
    getNotifications,
    deleteNotifications
}