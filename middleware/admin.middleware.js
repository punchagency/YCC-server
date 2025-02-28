const User = require("../models/user.model");

exports.isAdmin = async (req, res, next) => {
  console.log("Admin middleware hit");
  console.log("User from token:", req.user);

  try {
   
    const userId = req.user.userId?.userId || req.user.userId;
    console.log("Extracted userId:", userId);

    if (!userId) {
      console.log("User ID not found in token");
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const user = await User.findById(userId);
    console.log("Found user:", user);

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      console.log("User is not admin");
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    console.log("Admin access granted");
    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
