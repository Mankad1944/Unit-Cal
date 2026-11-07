const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getSystemConfig,
  updateSystemConfig,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public route to inspect maintenance/emergency status
router.get("/config/public", getSystemConfig);

// Protected Admin Routes
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/config", protect, adminOnly, getSystemConfig);
router.put("/config", protect, adminOnly, updateSystemConfig);

module.exports = router;
