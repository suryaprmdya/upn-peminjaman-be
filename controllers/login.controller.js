import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

dotenv.config();

export const login = async (req, res) => {
  const userLogin = req.body;

  try {
    // 1. Cari user dan MINTA field password secara eksplisit
    // (Asumsi di model Anda, password punya 'select: false')
    const user = await User.findOne({email: userLogin.email}).select(
      "+password"
    );
    if (!user) {
      return res.status(400).json({message: "Username atau password salah"});
    }

    // 2. Bandingkan password yang diinput dengan hash di database
    const isPasswordCorrect = await bcrypt.compare(
      userLogin.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({message: "Username atau password salah"});
    }

    // 3. Buat token JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role, // <-- PERUBAHAN: Masukkan role ke dalam token
      },
      process.env.JWT_KEY,
      {expiresIn: "1d"} // Token berlaku selama 1 hari
    );

    // 4. Kirim token sebagai httpOnly cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // Durasi cookie 1 hari (dalam milidetik)
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    const {password, ...otherDetails} = user._doc;

    // 5. Kirim respons sukses di body
    res.status(200).json({
      message: "Login berhasil",
      user: {
        id: otherDetails._id,
        username: otherDetails.username,
        email: otherDetails.email,
        role: otherDetails.role, // <-- PERUBAHAN: Kirim role ke frontend
      },
    });
  } catch (error) {
    console.error("Error saat login:", error);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server. Silakan coba lagi.",
    });
  }
};

export const testLogin = (req, res) => {
  res.json("ini dari route LOGIN");
};
