import Category from "../models/category.model.js";
import Product from "../../products/models/product.model.js";
import ProductMedia from "../../products/models/productMedia.model.js";

export const getAllCategoriesService = async () => {
  return await Category.find()
    .populate("industryId", "name slug")
    .populate("parentCategoryId", "name slug")
    .sort({ createdAt: -1 }).lean();
};

export const getMainCategoriesService = async () => {
  return await Category.find({ parentCategoryId: null, })
    .populate("industryId", "name slug")
    .sort({ name: 1 }).lean();
};

export const getCategoryDetailsService = async (slug) => {
  const category = await Category.findOne({ slug })
    .populate("industryId", "name slug")
    .populate("parentCategoryId", "name slug")
    .lean();

  if (!category) return null;

  const subCategories = await Category.find({ parentCategoryId: category._id, })
    .select("name slug imageUrl").sort({ name: 1 }).lean();

  const subCategoriesWithProducts = await Promise.all(
    subCategories.map(async (subCat) => {
      const products = await Product.find({ subCategoryId: subCat._id, })
        .select("name slug price").limit(8).lean();

      const productsWithMedia = await Promise.all(
        products.map(async (product) => {
          const media = await ProductMedia.find({ productId: product._id, })
            .select("url type isPrimary").lean();

          return { ...product, media, };
        }));

      return {
        ...subCat,
        products: productsWithMedia,
      };
    })
  );

  return {
    category: {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      categoryDescription: category.categoryDescription,
      industry: category.industryId,
      parentCategory: category.parentCategoryId,
    },
    subCategories: subCategoriesWithProducts,
  };
};