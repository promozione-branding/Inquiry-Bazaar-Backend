import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    source: {
        type: String,
        enum: [
            "facebook",
            "google",
            "website",
            "whatsapp",
            "manual",
            "indiamart",
            "tradeindia",
            "other",
        ],
        default: "facebook",
        index: true,
    },

    platform: {
        type: String,
    },

    metaLeadId: {
        type: String,
        sparse: true,
        unique: true,
        index: true,
    },

    name: {
        type: String,
        trim: true,
        required: true,
    },

    phone: {
        type: String,
        trim: true,
        index: true,
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
    },

    companyName: {
        type: String,
        trim: true,
    },

    gstNumber: {
        type: String,
        uppercase: true,
        trim: true,
    },

    place: {
        type: String,
        trim: true,
    },

    product: {
        type: String,
        trim: true,
    },

    message: {
        type: String,
        trim: true,
    },

    priceRange: Number,

    dealValue: {
        type: Number,
        default: 0,
    },

    expectedClosureDate: Date,

    stage: {
        type: String,
        enum: [
            "new",
            "contacted",
            "qualified",
            "proposal_sent",
            "negotiation",
            "won",
            "lost",
        ],
        default: "new",
        index: true,
    },

    status: {
        type: String,
        enum: [
            "open",
            "closed",
            "junk",
        ],
        default: "open",
    },

    remark: {
        type: String,
        trim: true,
    },

    campaignId: String,
    campaignName: String,
}, { timestamps: true, });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);