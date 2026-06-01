import Category from "../models/category.model.js";

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

export const getSubCategoriesService = async (parentCategoryId) => {
  return await Category.find({ parentCategoryId, })
    .populate("parentCategoryId", "name slug")
    .populate("industryId", "name slug")
    .sort({ name: 1 }).lean();
};