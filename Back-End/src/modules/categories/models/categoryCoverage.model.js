import mongoose from "mongoose";

const categoryCoverageSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        locations: [
            { type: String, trim: true, },
        ],
    },
    { timestamps: true, }
);

// prevent duplicate supplier + category records
categoryCoverageSchema.index(
    {
        supplierId: 1,
        subCategoryId: 1,
    },
    { unique: true, }
);

categoryCoverageSchema.index({
    subCategoryId: 1,
    locations: 1,
});

export default mongoose.models.CategoryCoverage || mongoose.model("CategoryCoverage", categoryCoverageSchema);