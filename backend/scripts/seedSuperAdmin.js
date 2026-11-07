const User = require("../models/User");

async function seedSuperAdmin() {
  try {
    const email = process.env.SUPERADMIN_EMAIL || "superadmin@unitcalc.io";
    const password = process.env.SUPERADMIN_PASSWORD || "SuperAdmin@2026!";

    if (!email || !password) {
      throw new Error(
        "SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required."
      );
    }

    if (password.length < 6) {
      throw new Error("Superadmin password must be at least 6 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    let admin = await User.findOne({ email: normalizedEmail })
      .select("+password");

    if (admin) {
      // Reset existing account password
      admin.name = "Super Admin";
      admin.password = password;
      admin.role = "superadmin";
      admin.status = "active";

      await admin.save();

      console.log("Superadmin account updated successfully.");
    } else {
      // Create new account
      await User.create({
        name: "Super Admin",
        email: normalizedEmail,
        password,
        role: "superadmin",
        status: "active",
        permissions: {},
      });

      console.log("Superadmin created successfully.");
    }
  } catch (error) {
    console.error("Superadmin seeding failed:", error.message);
    throw error;
  }
}

module.exports = seedSuperAdmin;