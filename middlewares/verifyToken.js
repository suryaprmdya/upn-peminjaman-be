// require('dotenv').config()
import dotenv from "dotenv"
import jwt from "jsonwebtoken";

dotenv.config()


export const verifyToken = (req, res, next) => {
  // 1. Get the token from the parsed cookies
  const token = req.cookies.accessToken;

  // 2. Check if the token exists
  if (!token) {
    return res.status(401).json({ message: "Akses ditolak. Silakan login." });
  }

  // 3. Verify the token
  try {
    const userPayload = jwt.verify(token, process.env.JWT_KEY);
    req.user = userPayload; // Attach user info to the request object
    next(); // Proceed to the next handler
  } catch (error) {
    return res.status(403).json({ message: "Token tidak valid." });
  }
};

export default verifyToken;