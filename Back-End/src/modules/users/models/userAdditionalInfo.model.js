import mongoose from "mongoose";

const additionalInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    panNumber: {
      type: String,
      uppercase: true,
    },

    aadhaarNumber: {
      type: String,
    },

    tanNumber: {
      type: String,
      uppercase: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdditionalInfo ||
  mongoose.model("AdditionalInfo", additionalInfoSchema);