const mongoose = require('mongoose');

const connectMongoDB = async ()=>{
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log("mongodb connected");
    } catch (error) {
        console.error(`Error while connecting to DB: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectMongoDB;