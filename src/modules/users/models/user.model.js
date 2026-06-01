import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
    },

    phone: String,

    otherEmail: {
      type: String,
      // unique: true,
    },

    otherPhone: String,

    password: String,

    profileImage: String,
    profileImageKey: String,

    role: {
      type: String,
      enum: ["buyer", "supplier", "admin"],
      default: "buyer",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", userSchema);