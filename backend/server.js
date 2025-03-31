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
const cors = require("cors");

dotenv.config();

// Cloudinary configuration
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["https://tweetwave.onrender.com", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes - these must come BEFORE the static file middleware
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationsRoutes);

// Handle OPTIONS requests for CORS preflight
app.options("*", cors());

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

    // Serve static files from the dist directory
    app.use(express.static(distPath));

    // This must be the LAST route
    // It ensures that all routes that aren't API routes or static files
    // are handled by React Router
    app.get("*", (req, res) => {
      // Always send the index.html for any unknown routes
      // This is crucial for Single Page Apps with client-side routing
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.error("Frontend build directory not found at:", distPath);
    // Add a fallback route if dist folder isn't found
    app.get("*", (req, res) => {
      res
        .status(404)
        .send(
          "Application not properly built. Please check the deployment logs."
        );
    });
  }
} else {
  // In development mode, provide a simple indication that the API is running
  app.get("/", (req, res) => {
    res.send("Tweetwave API is running in development mode");
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Tweetwave app listening on port ${PORT}!`);
  console.log(`Environment: ${nodeEnv}`);
  connectMongoDB();
});
