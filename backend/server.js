require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Connect to MongoDB
connectDB();

// Start server only after MongoDB connection and superadmin seeding
async function startServer() {
  try {
    await connectDB();

    const seedSuperAdmin = require("./scripts/seedSuperAdmin");
    await seedSuperAdmin();

    // Security Middleware
    app.use(helmet());

    // Dynamic CORS configuration for local dev and cloud deployment (Vercel, Render)
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps, curl, server-to-server)
          if (!origin) return callback(null, true);
          if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            process.env.NODE_ENV !== "production"
          ) {
            return callback(null, true);
          }
          return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: { message: "Too many requests from this IP, please try again later." },
    });
    app.use("/api", limiter);

    // API Routes
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/history", require("./routes/historyRoutes"));
    app.use("/api/admin", require("./routes/adminRoutes"));

    // Health check
    app.get("/api/health", (req, res) => {
      res.json({
        status: "online",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    app.get("/", (req, res) => {
      res.json({
        message: "Unit Calc MERN Backend is running successfully!",
        docs: "/api/health",
      });
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error("Server Error:", err.stack);
      res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
      });
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exitCode = 1;
  }
}

startServer();