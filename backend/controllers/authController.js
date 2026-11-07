const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SystemConfig = require("../models/SystemConfig");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "unitcalc_jwt_secret_key_2026_secure", {
    expiresIn: "30d",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check system registration policy
    let config = await SystemConfig.findOne();
    if (config && config.allowRegistration === false) {
      return res.status(403).json({ message: "Public registration is currently disabled by administrator." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // If first user, make Superadmin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "superadmin" : "user";

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      status: user.status || "active",
      createdAt: user.createdAt,
    };

    res.status(201).json({
      user: userPayload,
      token: generateToken(user._id),
      ...userPayload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account has been suspended. Please contact administrator." });
    }

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      status: user.status || "active",
      createdAt: user.createdAt,
    };

    res.json({
      user: userPayload,
      token: generateToken(user._id),
      ...userPayload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
