import express from "express";
const route = express.Router();

// import routes
// import authRoute from "./auth.route.js"
// import userRoute from "./user.route.js"

route.get("/testing", (req, res) => {
  res.json("Welcome to Web Service");
});

// route.use("/auth", authRoute)
// route.use("/users", userRoute)

export default route