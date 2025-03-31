const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const {v2} = require("cloudinary");
const path = require('path');
const authRoutes = require('./route/auth');
const userRoutes = require('./route/user');
const connectMongoDB = require('./db/connectMongoDB');
const postRoutes = require('./route/post');
const notificationsRoutes = require('./route/notification');

dotenv.config();

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit: "5mb"}));    
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationsRoutes);


if(process.env.NODE_ENV.trim() === "production"){
  const parentDir = path.resolve(__dirname, '..');
  app.use(express.static(path.join(parentDir, "/frontend/dist")));

  app.get("*", (req,res)=>{
    res.sendFile(path.resolve(parentDir, "frontend","dist","index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  connectMongoDB();
});