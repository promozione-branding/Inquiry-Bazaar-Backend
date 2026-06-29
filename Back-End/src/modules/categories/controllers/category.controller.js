import { getAllCategoriesService, getMainCategoriesService, getCategoryDetailsService, getSubCategoryDetailsService, getSubCategoryLocationDetailsService, createCategory, findCategoryById, updateCategory, removeCategory, addCategoryCoverageService, removeCategoryCoverageService, getCategoryCoverageService } from "../services/category.service.js";

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

export const getSubCategoryLocationDetails = async (req, res) => {
  try {
    const { slug, location } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const data = await getSubCategoryLocationDetailsService(slug, location, page, limit);

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

export const addCategory = async (req, res) => {
  try {
    const category = await createCategory({ ...req.body, file: req.file, });

    return res.status(201).json({ success: true, data: category, });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await findCategoryById(req.params.id);
    res.json({ success: true, data: category, });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const editCategory = async (req, res) => {
  try {
    const category = await updateCategory(
      req.params.id,
      { ...req.body, file: req.file, }
    );

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await removeCategory(req.params.id);

    res.json({
      success: true,
      message: "Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addCategoryCoverageController = async (req, res) => {
  try {
    const data = await addCategoryCoverageService(req.body);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const removeCategoryCoverageController = async (req, res) => {
  try {
    const data = await removeCategoryCoverageService(req.body);

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCategoryCoverageController = async (req, res) => {
  try {
    const data = await getCategoryCoverageService(req.params.supplierId);

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};