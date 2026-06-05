import mongoose from "mongoose";

const webpageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    slug: {
        type: String,
        unique: true,
    },

    hero: {
        color: String,
        heading: String,
        subHeading: String,
        image: String,
    },

    about: {
        heading: String,
        subHeading: String,
        description: String,
        image: String,
    },

    work: {
        experience: String,
        clients: String,
        projects: String,
        awards: String,
    },

    cta: {
        heading: String,
        subHeading: String,
    },

    faqSection: {
        image: String,
        faqs: [
            {
                question: String,
                answer: String,
            }
        ],
    },

}, { timestamps: true });

export default mongoose.models.Webpage || mongoose.model("Webpage", webpageSchema);