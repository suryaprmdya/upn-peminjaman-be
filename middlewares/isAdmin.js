export const isAdmin = (req, res, next) => {
  // Asumsi 1: verifyToken sudah berjalan dan req.user ada.
  // Asumsi 2: Payload token Anda memiliki field 'role'.
  //           Contoh payload: { id: "123", username: "admin", role: "admin" }

  // Jika Anda menggunakan 'role' (misal: "admin" atau "user")
  if (req.user && req.user.role === "admin") {
    next(); // Pengguna adalah admin, lanjutkan ke controller
  } else {
    // Pengguna diautentikasi (login) TETAPI bukan admin.
    return res.status(403).json({
      message: "Akses ditolak. Anda tidak memiliki hak sebagai admin.",
    });
  }
};

export default isAdmin;