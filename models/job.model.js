import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "pdf_process"
  payload: { type: Object, required: true },

  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },

  attempts: { type: Number, default: 0 },
  error: { type: String },

  lockedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
