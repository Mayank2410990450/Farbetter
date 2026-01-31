const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    const tokenFromCookie = req.cookies?.token;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
        return next(); // No token, just continue as guest
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // Invalid token? Just ignore it and treat as guest
        next();
    }
};
