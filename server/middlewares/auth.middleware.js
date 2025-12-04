const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Token can come from Authorization header (preferred for OAuth) OR from cookie (for regular login)
  // Authorization header takes precedence
  const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  
  const tokenFromCookie = req.cookies?.token;
  
  // Use header token if available (OAuth), otherwise fall back to cookie (regular login)
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

