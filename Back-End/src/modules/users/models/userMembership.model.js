import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        membershipType: {
            type: String,
            enum: ["starter", "growth", "pro", "elite"],
            required: true,
        },

        membershipStatus: {
            type: String,
            enum: ["active", "expired", "pending"],
            default: "pending",
        },

        paymentMethod: {
            type: String,
            enum: ["upi", "cheque", "bank_transfer", "cash"],
            required: true,
        },

        amountPaid: {
            type: Number,
            required: true,
        },

        transactionId: {
            type: String,
            default: "",
        },

        paymentDate: Date,

        startDate: Date,

        endDate: Date,

        invoice: {
            url: String,
            key: String,
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Membership", membershipSchema);