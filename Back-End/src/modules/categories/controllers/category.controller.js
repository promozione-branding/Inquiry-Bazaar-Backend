import { getAllCategoriesService, getMainCategoriesService, getCategoryDetailsService, getSubCategoryDetailsService } from "../services/category.service.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getMainCategories = async (req, res) => {
  try {
    const categories = await getMainCategoriesService();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch main categories",
    });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const { parentCategoryId } = req.params;

    const subCategories = await getCategoryDetailsService(parentCategoryId);

    return res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    console.error("Get Sub Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub categories",
    });
  }
};

export const getSubCategoryDetails = async (req, res) => {
  try {
    const data = await getSubCategoryDetailsService(req.params.slug);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};