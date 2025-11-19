import mongoose from "mongoose";
const {Schema} = mongoose;

const facilitySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Nama fasilitas wajib diisi"], // Menambahkan pesan error
      trim: true, // Menghapus spasi di awal/akhir
      // unique: true
    },

    // Deskripsi lebih lanjut mengenai fasilitas
    description: {
      type: String,
      required: [true, "Deskripsi fasilitas wajib diisi"],
      trim: true,
    },

    // Kapasitas maksimum fasilitas (misalnya: 100 orang)
    capacity: {
      type: Number,
      required: false, // Opsional, bisa juga diubah menjadi true jika wajib
      min: [0, "Kapasitas tidak boleh negatif"], // Validasi nilai minimum
    },

    category: {
      type: String,
      enum: ["Ruangan", "Peralatan", "Lainnya"], // Define allowed roles
      default: "Ruangan", // Set a default role
      required: true, // Opsional, bisa juga diubah menjadi true jika wajib
    },

    status: {
      type: String,
      enum: ["Tersedia", "Dipinjam"], // Define allowed roles
      default: "Tersedia", // Set a default role
      // required: true, // Opsional, bisa juga diubah menjadi true jika wajib
    },
    
    imageURL: {
      type: String,
      required: false, // Opsional
      trim: true,
    },
  },
  {
    // Opsi Schema:
    // Menambahkan dua field secara otomatis: createdAt dan updatedAt
    timestamps: true,
  }
);

// Opsional tapi SANGAT DIREKOMENDASIKAN: Index untuk unique case-insensitive
// Ini akan membuat 'Gym' dan 'gym' dianggap sama oleh database
facilitySchema.index(
  {name: 1},
  {
    unique: true,
    collation: {locale: "en", strength: 2}, // strength 2 = case-insensitive
  }
);

const Facility = mongoose.model("Facility", facilitySchema);

export default Facility;
