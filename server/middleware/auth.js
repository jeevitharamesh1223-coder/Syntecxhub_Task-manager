
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Read the Authorization header
  const authHeader = req.headers.authorization;

  // Reject requests without a Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Please log in.",
    });
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm the token contains the user ID
    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // Make the logged-in user's ID available to task routes
    req.userId = decoded.userId;

    // Continue to the requested route
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = authenticateToken;
