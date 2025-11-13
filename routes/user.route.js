import express from "express";
import { getUserLogin} from "../controllers/users.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const route = express.Router();

// get /api/auth/getUser
// route.get("/", getAllUser);
route.get("/profile", verifyToken, getUserLogin);
// route.get("/:email", verifyToken, getUserByEmail);

export default route;
