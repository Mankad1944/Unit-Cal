const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema(
  {
    isEmergencySuspended: {
      type: Boolean,
      default: false,
    },
    suspensionMessage: {
      type: String,
      default: "System is temporarily suspended for emergency maintenance. Please check back later.",
    },
    requireLogin: {
      type: Boolean,
      default: false,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    globalToolAvailability: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    roleDefaults: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        guest: {},
        user: {},
        admin: {},
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemConfig", systemConfigSchema);
