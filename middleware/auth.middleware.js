const { verifyToken: jwtVerify } = require("../utils/jwt.utils");

exports.verifyToken = (req, res, next) => {
  console.log("Auth middleware hit");
  console.log("Headers:", req.headers);

  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    console.log("No token provided");
    return res
      .status(401)
      .json({ status: "error", message: "Access denied. No token provided." });
  }

  const decoded = jwtVerify(token);
  console.log("Decoded token:", decoded);

  if (!decoded) {
    console.log("Invalid token");
    return res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token." });
  }
  

  req.user = decoded; 
  console.log("Token verified, proceeding to next middleware");
  next();
};