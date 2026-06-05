import mongoose from "mongoose";

const helpReplySchema = new mongoose.Schema(
  {
    helpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Help",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["SUPPLIER", "ADMIN"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.HelpReply ||
  mongoose.model("HelpReply", helpReplySchema);