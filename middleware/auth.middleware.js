const jwt = require("jsonwebtoken");

// Express middleware: checks for a valid "Authorization: Bearer <token>" header.

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

// If it failure, it stops the request with a 401 and never reaches the route handler.
  if (!token) {
    return res.status(401).json({ errorMessage: "Token not provided" });
  }
// If it  succeeds, it attaches the decoded user to req.user and calls next().
  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = payload.user;
    next();
  } catch (error) {
    return res.status(401).json({ errorMessage: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
