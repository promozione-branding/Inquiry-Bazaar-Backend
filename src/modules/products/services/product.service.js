import Product from "../models/product.model.js";
import ProductMedia from "../models/productMedia.model.js";
import User from "../../users/models/user.model.js";
import Business from "../../users/models/userBusiness.model.js";
import Webpage from "../../users/models/userWebpage.model.js";

export const getProductBySlugService = async (slug) => {
  const product = await Product.findOne({ slug })
    .populate("categoryId", "name slug")
    .populate("subCategoryId", "name slug").lean();

  if (!product) { return null; }

  const [media, supplier, business, webpage] = await Promise.all([
    ProductMedia.find({ productId: product._id, }).sort({ isPrimary: -1 }),
    User.findById(product.supplierId).select("name email phone profileImage").lean(),
    Business.findOne({ userId: product.supplierId, }).lean(),
    Webpage.findOne({ userId: product.supplierId, }).lean(),
  ]);

  const relatedProducts = await Product.find({
    categoryId: product.categoryId?._id, _id: { $ne: product._id },
  }).limit(12).lean();

  const relatedProductsWithMedia = await Promise.all(relatedProducts.map(async (item) => {
    const [media, supplier, business] = await Promise.all([
      ProductMedia.find({ productId: item._id }).lean(),
      User.findById(item.supplierId).select("name phone profileImage").lean(),
      Business.findOne({ userId: item.supplierId, }).lean(),
    ]);

    return {
      ...item, media,
      supplier: supplier ? { ...supplier, business, } : null,
    };
  })
  );

  return {
    product: {
      ...product, media,
      supplier: supplier ? { ...supplier, business, webpage, } : null,
    },
    relatedProducts: relatedProductsWithMedia,
  };
};