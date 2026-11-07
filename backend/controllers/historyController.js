const CalculationHistory = require("../models/CalculationHistory");

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const filter = userId ? { userId } : {};
    const history = await CalculationHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addHistory = async (req, res) => {
  try {
    const { category, title, expression, result, details } = req.body;
    if (!category || !title || !result) {
      return res.status(400).json({ message: "Category, title, and result are required" });
    }

    const item = await CalculationHistory.create({
      userId: req.user ? req.user._id : null,
      category,
      title,
      expression,
      result,
      details,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await CalculationHistory.deleteMany({ userId: req.user._id });
    res.json({ message: "History cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CalculationHistory.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.userId && req.user && item.userId.toString() !== req.user._id.toString() && req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized to delete this record" });
    }

    await item.deleteOne();
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
