const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// 1. Initialize Environment Variables
dotenv.config();

// 2. Database Connection
connectDB();

const app = express();

// ============================
// 3. Middlewares
// ============================


// ============================
// 3. CORS & IP Whitelist Configuration
// ============================

// IP Whitelist - Add your allowed IPs here
const IP_WHITELIST = [
  "https://switch2itech.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000",
  // Add more IPs/domains as needed
];

// CORS Origin Checker Function
const corsOriginChecker = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) {
    return callback(null, true);
  }

  // Check if origin is in whitelist
  if (IP_WHITELIST.includes(origin)) {
    callback(null, true);
  } else {
    // Fallback: Allow all origins for now (comment out for production)
    console.warn(`⚠️  CORS Request from unknown origin: ${origin}`);
    callback(null, true); // Set to false to block unknown origins
  }
};

// ✅ CORS Middleware with proper configuration
app.use(
  cors({
    origin: corsOriginChecker,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Length", "X-JSON-Response"],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // ✅ Essential for auth cookies

// ============================
// 4. API Routes
// ============================

// Import Route Handlers
// IMPORTANT: Verify these files exist and use module.exports = router;
const projectRoutes = require("./routes/projectRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRouter");
const testimonialRoutes = require("./routes/testimonialRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/products", productRoutes);
app.use("/api/testimonials", testimonialRoutes);

// ============================
// 5. Health Check & 404
// ============================

// Root Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Switch2itech Backend Working Successfully",
    timestamp: new Date().toISOString(),
  });
});

// Handling Undefined Routes (Fixed the 'matcher' crash by using app.use)
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ============================
// 6. Global Error Handler
// ============================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  console.error("ERROR 💥:", err);

  res.status(statusCode).json({
    status: status,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ============================
// 7. Server Configuration
// ============================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(` Server initialized on port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || "development"}`);
});
