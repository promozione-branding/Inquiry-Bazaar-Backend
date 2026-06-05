// models/Industry.js

import mongoose from "mongoose";

const industrySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        // ✅ SEO Fields
        metaTitle: {
            type: String,
            trim: true,
            default: "",
        },

        metaDescription: {
            type: String,
            trim: true,
            default: "",
        },

        imageUrl: {
            type: String,
            default: "",
        },

        imageKey: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Industry ||
    mongoose.model("Industry", industrySchema);