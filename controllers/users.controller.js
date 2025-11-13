import User from "../models/userModel.js";

export const getUserLogin = async (req, res) => {
  try {
    // 1. Dapatkan payload user dari middleware 'verifyToken'
    // 'req.user' berisi payload dari token (misal: { userId: '..._id' })
    // PASTIKAN saat Anda membuat token, Anda menyertakan 'userId'.
    const userIdFromToken = req.user.id; // <-- Sesuaikan key ini ('userId', 'id', '_id')

    if (!userIdFromToken) {
      return res.status(403).json({ message: "Payload token tidak valid." });
    }

    // 2. Cari user di database menggunakan ID dari token
    // Kita gunakan .select("-password") agar hash password tidak ikut terkirim
    const user = await User.findById(userIdFromToken).select("-password");

    if (!user) {
      // Kasus jika token valid tapi user-nya sudah dihapus
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // 3. Kirim data user sebagai respons
    res.status(200).json({
      message: "Data user login berhasil didapatkan",
      user: user,
    });

  } catch (error) {
    console.error("Error di getUserLogin:", error.message);
    res.status(500).json({ message: "Kesalahan server internal." });
  }
};