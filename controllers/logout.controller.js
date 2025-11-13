export const logout = (req, res) => {
  try {
    // Nama cookie ('accessToken') harus SAMA PERSIS dengan saat login
    res.clearCookie('accessToken');
    // res.clearCookie('userID');
    
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Gagal logout, terjadi kesalahan server." });
  }
};