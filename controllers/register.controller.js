import User from "../models/userModel.js";
import bcrypt from "bcrypt"; // <-- 1. Impor bcrypt

export const register = async (req, res) => {
  const { username, email, password, npm, role } = req.body;

  try {
    // 2. Pengecekan duplikat yang lebih efisien dan logis
    // Cek apakah USERNAME atau EMAIL sudah ada yang memakai.
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      // Memberi pesan yang lebih spesifik jika memungkinkan
      const message = existingUser.username === username
        ? "Username sudah terdaftar"
        : "Email sudah terdaftar";
      return res.status(400).json({ message }); // 409 Conflict lebih cocok
    }

    // 3. Hash password sebelum disimpan
    const saltRounds = 10; // Standar industri, semakin tinggi semakin aman tapi lambat
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Buat user baru dengan password yang sudah di-hash
    const newUser = await User.create({
      username,
      email,
      npm,
      role,
      password: hashedPassword, // Simpan hash, bukan password asli
    });

    res.status(201).json({
      message: "Akun Anda berhasil dibuat",
      userId: newUser._id,
      username: newUser.username
    });

  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

export const testRegister = (req, res) => {
  res.json("ini dari route REGISTER");
};
