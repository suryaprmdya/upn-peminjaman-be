import express from "express";
import { 
  createBooking, 
  getAllBookings, 
  getBookingById, 
  processApproval,
  getUserBookings, 
  testController
} from "../controllers/bookings.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

// import { uploadMiddleware } from "../middlewares/upload.js"; // Asumsi pakai Multer

const route = express.Router();

// Public / User Routes
// route.get("/", testController); // Testing Route /pengajuan
// route.post("/", uploadMiddleware.array("files"), createBooking); // Upload file saat create
route.post("/", verifyToken, createBooking); // Upload file saat create
route.get("/saya",verifyToken, getUserBookings);

// Adin / Approver Routes
route.get("/", getAllBookings);
// route.get("/:id", getBookingById);
// route.put("/:id/approval", processApproval); // Endpoint untuk ACC/Tolak

export default route;