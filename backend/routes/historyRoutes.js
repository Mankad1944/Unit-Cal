const express = require("express");
const router = express.Router();
const {
  getHistory,
  addHistory,
  clearHistory,
  deleteHistoryItem,
} = require("../controllers/historyController");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional auth middleware: extracts user if token provided, but doesn't reject if not
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "unitcalc_jwt_secret_key_2026_secure");
      req.user = await User.findById(decoded.id).select("-password");
    } catch (e) {
      // ignore
    }
  }
  next();
};

router.get("/", optionalAuth, getHistory);
router.post("/", optionalAuth, addHistory);
router.delete("/clear", optionalAuth, clearHistory);
router.delete("/:id", optionalAuth, deleteHistoryItem);

module.exports = router;
