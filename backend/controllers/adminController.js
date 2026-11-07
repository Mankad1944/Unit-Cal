const User = require("../models/User");
const CalculationHistory = require("../models/CalculationHistory");
const SystemConfig = require("../models/SystemConfig");

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });
    const totalCalculations = await CalculationHistory.countDocuments();
    const recentCalculations = await CalculationHistory.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    const config = (await SystemConfig.findOne()) || (await SystemConfig.create({}));

    res.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalCalculations,
      recentCalculations,
      systemConfig: config,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, permissions } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Protect superadmin from being suspended or downgraded by another admin
    if (user.role === "superadmin" && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Cannot modify root Super Administrator account" });
    }

    if (role) user.role = role;
    if (status) user.status = status;
    if (permissions) {
      user.permissions = { ...(user.permissions || {}), ...permissions };
      user.markModified("permissions");
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    const {
      isEmergencySuspended,
      suspensionMessage,
      requireLogin,
      allowRegistration,
      globalToolAvailability,
      roleDefaults,
    } = req.body;

    if (typeof isEmergencySuspended === "boolean") config.isEmergencySuspended = isEmergencySuspended;
    if (suspensionMessage !== undefined) config.suspensionMessage = suspensionMessage;
    if (typeof requireLogin === "boolean") config.requireLogin = requireLogin;
    if (typeof allowRegistration === "boolean") config.allowRegistration = allowRegistration;
    if (globalToolAvailability) {
      config.globalToolAvailability = { ...(config.globalToolAvailability || {}), ...globalToolAvailability };
      config.markModified("globalToolAvailability");
    }
    if (roleDefaults) {
      config.roleDefaults = { ...(config.roleDefaults || {}), ...roleDefaults };
      config.markModified("roleDefaults");
    }

    await config.save();
    res.json({ message: "System configuration updated", config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "superadmin") {
      return res.status(403).json({ message: "Cannot delete root Super Administrator" });
    }

    await User.findByIdAndDelete(id);
    await CalculationHistory.deleteMany({ userId: id });
    res.json({ message: "User and associated calculation records removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
