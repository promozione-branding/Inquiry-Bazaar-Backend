import Category from "../models/category.model.js";
import Product from "../../products/models/product.model.js";
import ProductMedia from "../../products/models/productMedia.model.js";
import User from "../../users/models/user.model.js";
import Membership from "../../users/models/userMembership.model.js";
import Business from "../../users/models/userBusiness.model.js";
import Webpage from "../../users/models/userWebpage.model.js";
import CategoryCoverage from "../models/categoryCoverage.model.js";
import { uploadToR2, deleteFromR2 } from "../../../utils/r2Service.js";
import Industry from "../../industries/models/industry.model.js";
import mongoose from "mongoose";
import { cityCoordinates } from "../../../utils/data.js";

const slugify = (text) => text.toLowerCase().trim().replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-").replace(/--+/g, "-")
  .replace(/^-+|-+$/g, "");

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

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
      const products = await Product.aggregate([
        { $match: { subCategoryId: subCat._id, }, },
        { $sample: { size: 300, }, },
        { $group: { _id: "$supplierId", product: { $first: "$$ROOT", }, }, },
        { $replaceRoot: { newRoot: "$product", }, },
        { $limit: 6, },
        {
          $project: {
            name: 1,
            slug: 1,
            price: 1,
            supplierId: 1,
          },
        },
      ]);

      if (!products.length) {
        return { ...subCat, products: [], };
      }

      const productIds = products.map((p) => p._id);
      const media = await ProductMedia.find({ productId: { $in: productIds, }, })
        .select("productId url type isPrimary").lean();

      const mediaMap = {};

      media.forEach((m) => {
        if (!mediaMap[m.productId]) {
          mediaMap[m.productId] = [];
        }

        mediaMap[m.productId].push(m);
      });

      return {
        ...subCat,
        products: products.map((p) => ({
          ...p,
          media: mediaMap[p._id] || [],
        })),
      };
    })
  );

  return {
    category: {
      _id: category._id,
      name: category.name,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      slug: category.slug,
      imageUrl: category.imageUrl,
      categoryDescription: category.categoryDescription,
      industry: category.industryId,
      parentCategory: category.parentCategoryId,
    },
    subCategories: subCategoriesWithProducts,
  };
};

export const getSubCategoryDetailsService = async (slug) => {
  const category = await Category.findOne({ slug })
    .populate("industryId", "name slug")
    .populate("parentCategoryId", "name slug").lean();

  if (!category) {
    return null;
  }

  const products = await Product.find({ $or: [{ subCategoryId: category._id }, { categoryId: category._id },], })
    .populate("categoryId", "name slug")
    .populate("subCategoryId", "name slug")
    .sort({ createdAt: -1 }).lean();

  const finalProducts = await Promise.all(
    products.map(async (product) => {
      const [media, supplier, business, webpage] = await Promise.all([
        ProductMedia.find({ productId: product._id, }).lean(),
        User.findById(product.supplierId).select("name email phone profileImage").lean(),
        Business.findOne({ userId: product.supplierId, }).lean(),
        Webpage.findOne({ userId: product.supplierId, }).lean(),
      ]);

      return {
        ...product, media,
        supplier: supplier ? { ...supplier, business, webpage } : null,
      };
    })
  );

  return {
    category: {
      _id: category._id,
      name: category.name,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      slug: category.slug,
      imageUrl: category.imageUrl,
      categoryDescription: category.categoryDescription,
      industry: category.industryId,
      parentCategory: category.parentCategoryId,
    },
    products: finalProducts,
  };
};


export const getSubCategoryLocationDetailsService = async (slug, location, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // CATEGORY
  const category = await Category.findOne({ slug })
    .populate("industryId", "name slug")
    .populate("parentCategoryId", "name slug")
    .lean();

  if (!category) {
    throw new Error("Category not found");
  }

  // LOCATION
  let nearbyCities = [];

  if (location === "India" || location === "All India") {
    nearbyCities = Object.keys(cityCoordinates);
  } else {
    const selected = cityCoordinates[location];
    if (!selected) {
      throw new Error("Invalid city");
    }

    nearbyCities = Object.keys(cityCoordinates).filter((city) =>
      getDistance(
        selected.lat,
        selected.lng,
        cityCoordinates[city].lat,
        cityCoordinates[city].lng
      ) <= 200);
  }

  // NORMAL SUPPLIERS
  const normalSupplierIds = await Business.find({ serviceLocations: { $in: nearbyCities, }, })
    .distinct("userId");
  const coverageSupplierIds = await CategoryCoverage.find({ subCategoryId: category._id, locations: { $in: nearbyCities, }, })
    .distinct("supplierId");
  const supplierIds = [...new Set([...normalSupplierIds, ...coverageSupplierIds,]),];
  const memberships = await Membership.find({ supplierId: { $in: supplierIds, }, membershipStatus: "active", }).lean();

  const priority = {
    elite: 1,
    pro: 2,
    growth: 3,
    starter: 4,
  };

  const membershipMap = Object.fromEntries(memberships.map((m) => [
    String(m.supplierId), {
      order: priority[m.membershipType] || 99,
      membershipType: m.membershipType,
      membershipStatus: m.membershipStatus,
      endDate: m.endDate,
    },]));

  // ONLY CATEGORY PRODUCTS
  const products = await Product.aggregate([
    {
      $match: {
        supplierId: {
          $in: supplierIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        $or: [
          { subCategoryId: category._id, },
          { categoryId: category._id, },
        ],
      },
    },
    { $sample: { size: 5000, }, },
    {
      $group: {
        _id: "$supplierId",
        product: { $first: "$$ROOT", },
      },
    },
    { $replaceRoot: { newRoot: "$product", }, },
  ]);

  // MEMBERSHIP SORT
  products.sort((a, b) =>
    (membershipMap[String(a.supplierId)]?.order || 99) -
    (membershipMap[String(b.supplierId)]?.order || 99));

  // PAGINATION
  const paginated = products.slice(skip, skip + Number(limit));
  const final = await Promise.all(paginated.map(async (product) => {
    const [media, supplier, business, webpage,] = await Promise.all([
      ProductMedia.find({ productId: product._id, }).lean(),
      User.findById(product.supplierId).select("name email phone profileImage").lean(),
      Business.findOne({ userId: product.supplierId, }).lean(),
      Webpage.findOne({ userId: product.supplierId, }).lean(),
    ]);

    return {
      ...product,
      media,
      supplier: {
        ...supplier,
        membership: membershipMap[String(product.supplierId)] || { membershipType: "normal", },
        business,
        webpage,
      },
    };
  }));

  return {
    category: {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      categoryDescription: category.categoryDescription,
      industry: category.industryId,
      parentCategory: category.parentCategoryId,
      faqs: category.faqs || [],
    },

    location,
    page: Number(page),
    limit: Number(limit),
    totalProducts: products.length,
    totalPages: Math.ceil(products.length / limit),
    products: final,
  };
};


export const createCategory = async ({ name, metaTitle, metaDescription, imageAlt, categoryDescription,citymetaTitle ,citymetaDescription,  industryId, parentCategoryId, faqs, file, }) => {
  if (!name) throw new Error("Name required");
  if (!industryId) throw new Error("Industry required");

  const industry = await Industry.findById(industryId);
  if (!industry) throw new Error("Invalid industry");

  const slug = slugify(name);
  const exists = await Category.findOne({ slug, });
  if (exists) throw new Error("Category already exists");

  let imageUrl = "";
  let imageKey = "";

  if (file) {
    const uploaded = await uploadToR2({
      file: file.buffer,
      folder: "categories",
      fileName: `${Date.now()}-${file.originalname}`,
      contentType: file.mimetype,
    });

    imageUrl = uploaded.url;
    imageKey = uploaded.key;
  }

  return await Category.create({
    name,
    slug,
    metaTitle: metaTitle || name,
    metaDescription: metaDescription || `Explore ${name}`,
    categoryDescription,
    citymetaTitle ,
    citymetaDescription,
    industryId,
    parentCategoryId: parentCategoryId || null,
    imageUrl,
    imageKey,
    imageAlt,
    faqs: faqs ? JSON.parse(faqs) : [],
  });

};

export const findCategoryById = async (id) => {
  return await Category.findById(id);
};

export const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");

  if (data.file) {
    if (category.imageKey) {
      await deleteFromR2(category.imageKey);
    }

    const uploaded = await uploadToR2({
      file: data.file.buffer,
      folder: "categories",
      fileName: `${Date.now()}-${data.file.originalname}`,
      contentType: data.file.mimetype,
    });

    category.imageUrl = uploaded.url;
    category.imageKey = uploaded.key;
  }

  category.name = data.name;
  category.industryId = data.industryId;
  category.parentCategoryId = data.parentCategoryId || null;
  category.metaTitle = data.metaTitle;
  category.citymetaTitle = data.citymetaTitle;
  category.imageAlt = data.imageAlt;
  category.metaDescription = data.metaDescription;
  category.citymetaDescription = data.citymetaDescription;
  category.categoryDescription = data.categoryDescription;
  category.faqs = JSON.parse(data.faqs || "[]");

  await category.save();
  return category;
};

export const removeCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  if (category.imageKey) {
    await deleteFromR2(category.imageKey);
  }

  await Category.findByIdAndDelete(id);
  return true;
};

export const addCategoryCoverageService = async ({ supplierId, subCategoryId, city, }) => {
  let row = await CategoryCoverage.findOne({ supplierId, subCategoryId, });

  if (!row) {
    row = await CategoryCoverage.create({
      supplierId,
      subCategoryId,
      locations: [city],
    });
  } else {
    if (!row.locations.includes(city)) {
      row.locations.push(city);
      await row.save();
    }
  }

  return row;
};

export const removeCategoryCoverageService = async ({ supplierId, subCategoryId, city, }) => {
  return CategoryCoverage.findOneAndUpdate(
    { supplierId, subCategoryId, },
    { $pull: { locations: city }, },
    { new: true, }
  );
};

export const getCategoryCoverageService = async (supplierId) => {
  return CategoryCoverage.find({ supplierId, })
    .populate("subCategoryId", "name slug");
};