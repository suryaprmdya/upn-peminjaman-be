import express from "express";
import {register, testRegister} from "../controllers/register.controller.js";
import {login, testLogin} from "../controllers/login.controller.js";
import {logout} from "../controllers/logout.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const route = express.Router();

// Post /register
route.post("/register", register);
route.get("/register", testRegister);

// post /auth/login
route.get("/login", testLogin);
route.post("/login", login);

// post /auth/logout
route.post("/logout", verifyToken, logout);

export default route;
