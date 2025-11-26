import mongoose from "mongoose";
const {Schema} = mongoose;

// --- SUB-SCHEMAS (Embedded) ---

// 1. Requirements (Syarat dokumen)
const requirementSchema = new Schema({
  fileName: {type: String, required: true},
  filePath: {type: String, required: true},
});

// 2. Activity Logs (Log aktivitas)
const activityLogSchema = new Schema({
  logType: {type: String, required: true}, // Misal: "CREATED", "APPROVED"
  timestamp: {type: Date, default: Date.now},
});

// 3. Topsis Evaluation (Nilai evaluasi per kriteria)
const topsisEvaluationSchema = new Schema({
  criterionId: {
    type: Schema.Types.ObjectId,
    ref: "AhpCriteria",
    required: true,
  },
  value: {type: Number, required: true}, // Nilai input untuk kriteria tersebut
});

// 4. Approval (Data persetujuan)
const approvalSchema = new Schema(
  {
    approverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    decision: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
    topsisScore: {type: Number}, // Hasil perhitungan TOPSIS
    remarks: {type: String}, // Catatan revisi/penolakan
  },
  {timestamps: true}
); // akan membuat createdAt (approvedAt)

// --- MAIN SCHEMA ---

const bookingSchema = new Schema(
  {
    // Info Dasar
    eventName: {type: String, required: true},
    status: {
      type: String,
      enum: ["pending", "process", "approved", "rejected"],
      default: "pending",
    },

    // References (Foreign Keys)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    Date: {type: Date, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},

    // Embedded Documents (Composition sesuai diagram)
    requirements: [requirementSchema], // Array of Requirements
    approval: approvalSchema, // Single Object Approval
    activityLogs: [activityLogSchema], // Array of Logs
    topsisEvaluation: [topsisEvaluationSchema], // Array of Evaluations (Nilai kriteria)
  },
  {
    timestamps: true, // Otomatis handle created_at / updated_at
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
