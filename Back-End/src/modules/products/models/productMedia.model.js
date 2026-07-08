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

    altName: {
      type: String,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productMediaSchema.index({ productId: 1 });

export default mongoose.models.ProductMedia ||
  mongoose.model("ProductMedia", productMediaSchema);