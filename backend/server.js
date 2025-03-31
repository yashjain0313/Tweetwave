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

// Configure CORS with appropriate origins
const allowedOrigins = [
  "https://tweetwave.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  // For testing directly in browser
  "https://tweetwavee.onrender.com",
];

// CORS middleware setup - this is critical for authentication across domains
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // This is important for cookies/authentication
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle OPTIONS preflight requests
app.options("*", cors());

// Body parser and cookie middleware
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

// Add a simple test route to check if the API is accessible
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working properly", env: nodeEnv });
});

// All other routes are handled depending on environment
if (nodeEnv === "production") {
  const parentDir = path.resolve(__dirname, "..");
  const distPath = path.join(parentDir, "frontend", "dist");

  console.log(`Looking for frontend build at: ${distPath}`);

  if (fs.existsSync(distPath)) {
    console.log("Frontend build directory found, serving static files");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.error("Frontend build directory not found at:", distPath);
    app.get("*", (req, res) => {
      res
        .status(404)
        .send(
          "Application not properly built. Please check the deployment logs."
        );
    });
  }
} else {
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
