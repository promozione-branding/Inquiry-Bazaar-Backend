import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        companyName: {
            type: String,
            trim: true,
        },

        ceoName: {
            type: String,
            trim: true,
        },

        gstNumber: {
            type: String,
            uppercase: true,
        },

        establishedDate: {
            type: Date,
        },

        ownershipType: {
            type: String,
            enum: ["Proprietorship", "Partnership", "Pvt Ltd", "LLP", "Other"],
        },

        businessType: {
            type: String,
            enum: ["Manufacturer", "Trader", "Service Provider", "Wholesaler", "Retailer", "Other"],
        },

        businessField: {
            type: String,
        },

        annualTurnover: {
            type: String, // keep string because ranges like "₹10L - ₹50L"
        },

        numberOfEmployees: {
            type: String, // e.g. "10-50"
        },

        address: {
            type: String,
        },

        // Social Links
        social: {
            facebook: String,
            instagram: String,
            linkedin: String,
            youtube: String,
            telegram: String,
            whatsapp: String,
            twitter: String,
        },

    },
    { timestamps: true }
);

export default mongoose.models.Business ||
    mongoose.model("Business", businessSchema);