import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    deviceName: String,
    browser: String,
    os: String,
    deviceType: String,
    ip: String,

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// ✅ SAFE EXPORT
const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;