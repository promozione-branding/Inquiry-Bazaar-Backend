import mongoose from "mongoose";

const helpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // your user model
            required: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        issueType: {
            type: String,
            enum: ["CATEGORY", "PRODUCT", "PAYMENT", "PROFILE", "COMPLAINT", "OTHER"],
            default: "OTHER",
        },

        status: {
            type: String,
            enum: ["OPEN", "IN PROGRESS", "RESOLVED"],
            default: "OPEN",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Help ||
    mongoose.model("Help", helpSchema);