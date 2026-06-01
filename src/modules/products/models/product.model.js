import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brandName: {
      type: String,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    price: {
      type: Number,
    },

    priceType: {
      type: String,
      enum: ["fixed", "starting", "range", "on_request"],
      default: "on_request",
    },

    minOrderQty: {
      type: Number,
      default: 1,
    },

    description: {
      type: String,
      trim: true,
    },

    specifications: [
      {
        key: String,
        value: String,
      },
    ],

    deliveryTime: String,
    packagingDetails: String,
    supplyAbility: String,
    paymentTerms: String,
    youtubeLink: String,
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);