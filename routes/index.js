import express from "express";
const route = express.Router();

// import routes
import authRoute from "./auth.route.js"
import userRoute from "./user.route.js"
import facilitiesRoute from "./facilities.route.js"
import bookingRoute from "./booking.route.js"

// test route
route.get("/testing", (req, res) => {
  res.json("Welcome to Web Service");
});

route.use("/auth", authRoute)
route.use("/facilities", facilitiesRoute)
route.use("/user", userRoute)
route.use("/pengajuan", bookingRoute)

export default route