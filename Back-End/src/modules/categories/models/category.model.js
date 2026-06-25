import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },

    categoryDescription: {
      type: String,
    },

    industryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Industry",
      required: true,
    },

    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    imageKey: {
      type: String,
      default: "",
    },

    imageAlt: {
      type: String,
    },

    faqs: [
      {
        question: {
          type: String,
          trim: true,
        },

        answer: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", categorySchema);