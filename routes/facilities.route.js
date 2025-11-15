import express from "express";
import {
  createFacility,
  deleteFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
} from "../controllers/facilities.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";

const route = express.Router();

// --- Definisi Rute ---

// Rute Publik (Tidak perlu middleware isAdmin)
// GET /api/facilities
route.get("/", getAllFacilities);

// GET /api/facilities/:id
route.get("/:id", getFacilityById);

// Rute Khusus Admin (Perlu middleware isAdmin)
// Middleware 'isAdmin' akan dijalankan SEBELUM fungsi controller

// POST /api/facilities
route.post("/", [verifyToken, isAdmin], createFacility);

// PUT /api/facilities/:id
route.put("/:id", [verifyToken, isAdmin], updateFacility);

// DELETE /api/facilities/:id
route.delete("/:id", [verifyToken, isAdmin],   deleteFacility);

export default route;
