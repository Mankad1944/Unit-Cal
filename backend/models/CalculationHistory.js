const mongoose = require("mongoose");

const calculationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: ["unit", "financial", "basic", "wv", "other"],
    },
    title: {
      type: String,
      required: true,
    },
    expression: {
      type: String,
      default: "",
    },
    result: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CalculationHistory", calculationHistorySchema);
