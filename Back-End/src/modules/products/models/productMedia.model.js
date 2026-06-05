import mongoose from "mongoose";

const productMediaSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video", "pdf"],
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductMedia ||
  mongoose.model("ProductMedia", productMediaSchema);