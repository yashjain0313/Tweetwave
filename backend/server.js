const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { v2 } = require("cloudinary");
const path = require("path");
const authRoutes = require("./route/auth");
const userRoutes = require("./route/user");
const connectMongoDB = require("./db/connectMongoDB");
const postRoutes = require("./route/post");
const notificationsRoutes = require("./route/notification");
const fs = require("fs");

dotenv.config();

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationsRoutes);

// Serve static frontend in production
const nodeEnv = process.env.NODE_ENV
  ? process.env.NODE_ENV.trim()
  : "development";
console.log(`Current NODE_ENV: ${nodeEnv}`);

if (nodeEnv === "production") {
  const parentDir = path.resolve(__dirname, "..");
  const distPath = path.join(parentDir, "frontend", "dist");

  console.log(`Looking for frontend build at: ${distPath}`);

  // Check if the frontend build directory exists
  if (fs.existsSync(distPath)) {
    console.log("Frontend build directory found, serving static files");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.error("Frontend build directory not found at:", distPath);
  }
}

app.listen(PORT, () => {
  console.log(`Tweetwave app listening on port ${PORT}!`);
  console.log(`Environment: ${nodeEnv}`);
  connectMongoDB();
});
