import Booking from "../models/bookingsModel.js";
import Facility from "../models/facilityModel.js";
import mongoose from "mongoose";

/**
 * Helper function untuk mengecek apakah ID valid
 * @param {string} id - ID yang akan dicek
 * @returns {boolean} - True jika valid, false jika tidak
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const testController = (req, res) => {
  res.json("Booking Controller is working");
};

// --- 1. CREATE BOOKING (Mengajukan Peminjaman) ---
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      eventName,
      facility,
      user,
      startTime,
      endTime,
      date,
      organization,
      participant,
      //   topsisEvaluation,
    } = req.body;

    // A. Validasi Dasar
    if (new Date(startTime) >= new Date(endTime)) {
      throw new Error("Waktu selesai harus setelah waktu mulai.");
    }

    // B. Cek Ketersediaan Fasilitas (Conflict Check)
    // Mencari booking lain di facilityId yang sama, statusnya BUKAN cancelled/rejected,
    // dan waktunya beririsan.
    const conflictBooking = await Booking.findOne({
      facility,
      status: {$nin: ["cancelled", "rejected"]}, // Abaikan yang batal/tolak
      $or: [
        {
          startTime: {$lt: new Date(endTime)},
          endTime: {$gt: new Date(startTime)},
        },
      ],
    }).session(session);

    if (conflictBooking) {
      throw new Error("Fasilitas tidak tersedia pada jam tersebut (Bentrok).");
    }

    // C. Handle File Upload (Requirements)
    // Asumsi: Middleware upload (Multer) menyimpan file di req.files
    let requirementsData = [];
    if (req.files && req.files.length > 0) {
      requirementsData = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path, // atau URL cloud storage
      }));
    }

    // D. Buat Booking Baru
    const newBooking = new Booking({
      eventName,
      facility,
      user,
      startTime, // Pastikan field ini ada di schema Booking (lihat catatan di bawah)
      endTime,
      date,
      organization,
      participant,
      requirements: requirementsData,
      //   topsisEvaluation: JSON.parse(topsisEvaluation || "[]"), // Parsing data kriteria SPK
      status: "pending",
      activityLogs: [
        {
          logType: "CREATED",
          timestamp: new Date(),
        },
      ],
    });

    await newBooking.save({session});
    await session.commitTransaction();

    res.status(201).json({
      message: "Booking berhasil diajukan, menunggu persetujuan.",
      data: newBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({message: error.message});
  } finally {
    session.endSession();
  }
};

// --- 2. GET ALL BOOKINGS (Untuk Admin/Dashboard) ---
export const getAllBookings = async (req, res) => {
  try {
    const {status, facilityId} = req.query;
    let query = {};

    if (status) query.status = status;
    if (facilityId) query.facilityId = facilityId;

    const bookings = await Booking.find(query)
      .populate("user", "username npm email") // Ambil info user
      .populate("facility", "name category") // Ambil info fasilitas
      .sort({createdAt: -1});

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// --- 3. GET BOOKING BY ID (Detail) ---
export const getBookingById = async (req, res) => {
  try {
    const {id} = req.params;
    const booking = await Booking.findById(id)
      .populate("userId", "fullName npm")
      .populate("facilityId", "facilityName description")
      .populate("approval.approverId", "fullName role"); // Lihat siapa yang menyetujui

    if (!booking)
      return res.status(404).json({message: "Booking tidak ditemukan"});

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// --- 4. APPROVE / REJECT BOOKING (Untuk Admin/Approver) ---
export const processApproval = async (req, res) => {
  try {
    const {id} = req.params;
    const {decision, approverId, remarks, topsisScore} = req.body;
    // decision: 'approved' | 'rejected'

    const booking = await Booking.findById(id);
    if (!booking)
      return res.status(404).json({message: "Booking tidak ditemukan"});

    // Update Status Utama
    booking.status = decision;

    // Update Embedded Approval Data
    booking.approval = {
      approverId,
      decision,
      topsisScore: topsisScore || 0, // Hasil hitungan SPK (jika ada)
      remarks,
    };

    // Tambah Log Aktivitas
    booking.activityLogs.push({
      logType: decision.toUpperCase(),
      timestamp: new Date(),
    });

    await booking.save();

    res.status(200).json({
      message: `Booking berhasil di-${decision}`,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// --- 5. GET USER HISTORY (History Saya) ---
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user.id; // Atau ambil dari req.user.id jika pakai JWT
    // res.status(200).json({message: `Get bookings for user ${user} - to be implemented`});

    const bookings = await Booking.find({user})
      .populate("facility", "name")
      .sort({createdAt: -1});

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// --- 5. DELETE BOOKING BY ID ---
export const deleteBooking = async (req, res) => {
  try {
    const {id} = req.params;

    // Cek format ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({message: "ID Pengajuan tidak valid"});
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({message: "Fasilitas tidak ditemukan"});
    }

    res
      .status(200)
      .json({message: "Pengajuan berhasil dihapus", booking: deletedBooking});
  } catch (error) {
    res
      .status(500)
      .json({message: "Terjadi kesalahan pada server", error: error.message});
  }
};

// --- 6. UPDATE BOOKING BY ID (User Edit Pengajuan) ---
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validasi ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "ID pengajuan tidak valid." });
    }

    // 2. Cari booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Pengajuan tidak ditemukan." });
    }

    // 3. Pastikan user hanya bisa edit miliknya sendiri (opsional)
    // if (booking.user.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Anda tidak berhak mengedit pengajuan ini." });
    // }

    // 4. Ambil data dari body
    const { 
      eventName,
      facility,
      startTime,
      endTime,
      date,
      organization,
      participant
    } = req.body;

    // 5. Validasi waktu
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "Waktu selesai harus setelah waktu mulai." });
    }

    // 6. Cek bentrok jadwal jika facility, startTime, atau endTime berubah
    if (facility || startTime || endTime) {
      const conflict = await Booking.findOne({
        _id: { $ne: id }, // abaikan booking ini sendiri
        facility: facility || booking.facility,
        status: { $nin: ["cancelled", "rejected"] },
        startTime: { $lt: new Date(endTime || booking.endTime) },
        endTime: { $gt: new Date(startTime || booking.startTime) },
      });

      if (conflict) {
        return res.status(400).json({
          message: "Fasilitas tidak tersedia pada waktu yang dipilih (jadwal bentrok).",
        });
      }
    }

    // 7. Update field yang boleh diubah user
    booking.eventName = eventName || booking.eventName;
    booking.facility = facility || booking.facility;
    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;
    booking.date = date || booking.date;
    booking.organization = organization || booking.organization;
    booking.participant = participant || booking.participant;

    // 8. Jika ada upload file baru
    if (req.files && req.files.length > 0) {
      const uploadedFiles = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
      }));
      booking.requirements = uploadedFiles;
    }

    // 9. Tambahkan log aktivitas
    booking.activityLogs.push({
      logType: "UPDATED",
      timestamp: new Date(),
    });

    // 10. Simpan perubahan
    await booking.save();

    res.status(200).json({
      message: "Pengajuan berhasil diperbarui.",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
