import mongoose from "mongoose";

const QrSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  token: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120,
  },
});

export default mongoose.model("QrSession", QrSessionSchema, "QrSessions");
