import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true, // one bank per user
    },

    accountNumber: {
      type: String,
    },

    accountHolderName: {
      type: String,
    },

    bankName: String,
    branchName: String,

    ifsc: {
      type: String,
      uppercase: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Bank ||
  mongoose.model("Bank", bankSchema);