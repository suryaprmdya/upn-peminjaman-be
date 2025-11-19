// Import model Facility
import Facility from "../models/facilityModel.js";
import mongoose from "mongoose"; // Diperlukan untuk cek validitas ObjectId

/**
 * Helper function untuk mengecek apakah ID valid
 * @param {string} id - ID yang akan dicek
 * @returns {boolean} - True jika valid, false jika tidak
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * 1. GET /api/facilities
 * Deskripsi: Menampilkan semua fasilitas
 */
export const getAllFacilities = async (req, res) => {
  try {
    // Cari semua dokumen di koleksi Facility
    const facilities = await Facility.find();
    res.status(200).json(facilities);
  } catch (error) {
    res
      .status(500)
      .json({message: "Terjadi kesalahan pada server", error: error.message});
  }
};

/**
 * 2. GET /api/facilities/:id
 * Deskripsi: Detail fasilitas tertentu
 */
export const getFacilityById = async (req, res) => {
  try {
    const {id} = req.params;

    // Cek apakah format ID valid sebelum query
    if (!isValidObjectId(id)) {
      return res.status(400).json({message: "ID fasilitas tidak valid"});
    }

    const facility = await Facility.findById(id);

    // Jika fasilitas tidak ditemukan
    if (!facility) {
      return res.status(404).json({message: "Fasilitas tidak ditemukan"});
    }

    res.status(200).json(facility);
  } catch (error) {
    res
      .status(500)
      .json({message: "Terjadi kesalahan pada server", error: error.message});
  }
};

/**
 * 3. POST /api/facilities
 * Deskripsi: Tambah data fasilitas (Admin)
 */
export const createFacility = async (req, res) => {
  try {
    const {name, description, capacity, imageURL, status, category} = req.body;

    // Buat instans baru berdasarkan model
    const newFacility = new Facility({
      name,
      status,
      description,
      capacity,
      category,
      imageURL,
    });

    // Simpan ke database
    const savedFacility = await newFacility.save();

    // Kirim respon 201 Created
    res.status(201).json(savedFacility);
  } catch (error) {
    // --- TAMBAHKAN PENANGANAN ERROR DUPLIKAT ---
    if (error.code === 11000) {
      // Kode error MongoDB untuk duplikat
      return res.status(409).json({
        message: `Fasilitas dengan nama "${req.body.name}" sudah ada.`,
        field: Object.keys(error.keyValue)[0], // Menunjukkan field apa yang duplikat
      });
    }

    // Tangani error validasi dari Mongoose
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({message: "Data tidak valid", errors: error.errors});
    }
    res
      .status(500)
      .json({message: "Terjadi kesalahan pada server", error: error.message});
  }
};

/**
 * 4. PUT /api/facilities/:id
 * Deskripsi: Edit data fasilitas (Admin)
 */
export const updateFacility = async (req, res) => {
  try {
    const {id} = req.params;
    const {name, description, capacity, imageURL, status, category} = req.body;

    // Cek format ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({message: "ID fasilitas tidak valid"});
    }

    // Opsi { new: true } untuk mengembalikan dokumen yang *sudah di-update*
    // Opsi { runValidators: true } untuk menjalankan validasi schema (misal: 'required')
    const updatedFacility = await Facility.findByIdAndUpdate(
      id,
      {name, description, capacity, imageURL, status, category}, // Data baru
      {new: true, runValidators: true}
    );

    if (!updatedFacility) {
      return res.status(404).json({message: "Fasilitas tidak ditemukan"});
    }

    res.status(200).json(updatedFacility);
  } catch (error) {
    // Tangani error validasi
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({message: "Data tidak valid", errors: error.errors});
    }
    res
      .status(500)
      .json({message: "Terjadi kesalahan pada server", error: error.message});
  }
};

/**
 * 5. DELETE /api/facilities/:id
 * Deskripsi: Hapus fasilitas (Admin)
 */
export const deleteFacility = async (req, res) => {
  try {
    const {id} = req.params;

    // Cek format ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({message: "ID fasilitas tidak valid"});
    }

    const deletedFacility = await Facility.findByIdAndDelete(id);

    if (!deletedFacility) {
      return res.status(404).json({message: "Fasilitas tidak ditemukan"});
    }

    res
      .status(200)
      .json({message: "Fasilitas berhasil dihapus", facility: deletedFacility});
  } catch (error) {
    res
      .status(500)
      .json({message: "Terjadi kesalahan pada server", error: error.message});
  }
};
