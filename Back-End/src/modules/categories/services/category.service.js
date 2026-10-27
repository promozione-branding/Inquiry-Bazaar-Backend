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
    .select("name slug imageUrl imageAlt").sort({ name: 1 }).lean();

  const subCategoriesWithProducts = await Promise.all(
    subCategories.map(async (subCat) => {
      const products = await Product.aggregate([
        { $match: { subCategoryId: subCat._id, }, },
        { $sample: { size: 300, }, },
        { $group: { _id: "$supplierId", product: { $first: "$$ROOT", }, }, },
        { $replaceRoot: { newRoot: "$product", }, }, { $limit: 6, },
        { $project: { name: 1, slug: 1, price: 1, supplierId: 1, }, },
      ]);

      if (!products.length) {
        return { ...subCat, products: [], };
      }

      const productIds = products.map((p) => p._id);
      const media = await ProductMedia.find({ productId: { $in: productIds, }, })
        .select("productId url type isPrimary altName").lean();

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
  // console.time("Metacategory");
  const category = await Category.findOne({ slug })
  // console.timeEnd("Metacategory");

  if (!category) {
    return null;
  }

  return {
    category: {
      _id: category._id,
      name: category.name,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      citymetaTitle: category.citymetaTitle,
      citymetaDescription: category.citymetaDescription,
      slug: category.slug,
      categoryDescription: category.categoryDescription,
    },
  };
};

const MEMBERSHIP_PRIORITY = {
  elite: 1,
  pro: 2,
  growth: 3,
  starter: 4,
};

const DELHI_CITIES = ["Delhi", "New Delhi"];

export const getSubCategoryLocationDetailsService = async (
  slug,
  location,
  page = 1,
  limit = 10
) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 10));

  const skip = (page - 1) * limit;

  // CATEGORY
  const category = await Category.findOne({ slug })
    .populate("industryId", "name slug")
    .populate("parentCategoryId", "name slug")
    .lean();

  if (!category) {
    throw new Error("Category not found");
  }

  const isAllIndia =
    location?.toLowerCase() === "india" ||
    location?.toLowerCase() === "all india";

  const selectedCity = isAllIndia
    ? null
    : Object.keys(cityCoordinates).find(
      (city) => city.toLowerCase() === location?.toLowerCase()
    );

  if (!isAllIndia && !selectedCity) {
    throw new Error("Invalid city");
  }

  // FIND NEARBY CITIES
  let nearbyCities = [];

  if (isAllIndia) {
    nearbyCities = Object.keys(cityCoordinates);
  } else {
    const selected = cityCoordinates[selectedCity];

    nearbyCities = Object.keys(cityCoordinates).filter((city) => {
      const coordinates = cityCoordinates[city];

      return (
        getDistance(
          selected.lat,
          selected.lng,
          coordinates.lat,
          coordinates.lng
        ) <= 200
      );
    });
  }

  // Reusable supplier discovery
  const getSupplierIds = async (cities) => {
    const [businessIds, coverageIds] = await Promise.all([
      Business.distinct("userId", {
        serviceLocations: { $in: cities },
      }),

      CategoryCoverage.distinct("supplierId", {
        subCategoryId: category._id,
        locations: { $in: cities },
      }),
    ]);

    return [
      ...new Set(
        [...businessIds, ...coverageIds].map((id) => String(id))
      ),
    ];
  };

  // Fetch one product per supplier for this category
  const getProducts = async (supplierIds) => {
    if (!supplierIds.length) return [];

    const objectIds = supplierIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    return Product.aggregate([
      {
        $match: {
          supplierId: { $in: objectIds },
          $or: [
            { subCategoryId: category._id },
            { categoryId: category._id },
          ],
        },
      },
      // Deterministic product selection per supplier
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: "$supplierId",
          product: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$product" } },
    ]);
  };

  // PRIMARY LOCATION PRODUCTS
  const primarySupplierIds = await getSupplierIds(nearbyCities);

  let products = await getProducts(primarySupplierIds);
  let fallbackApplied = false;

  // DELHI FALLBACK
  // Only when no matching products exist in selected area
  if (!isAllIndia && products.length === 0) {
    const delhiSupplierIds = await getSupplierIds(DELHI_CITIES);

    products = await getProducts(delhiSupplierIds);
    fallbackApplied = products.length > 0;
  }

  // MEMBERSHIPS
  const productSupplierIds = [
    ...new Set(products.map((p) => String(p.supplierId))),
  ];

  const memberships = await Membership.find({
    supplierId: { $in: productSupplierIds },
    membershipStatus: "active",
  }).lean();

  const membershipMap = {};

  for (const membership of memberships) {
    const supplierId = String(membership.supplierId);

    const current = membershipMap[supplierId];
    const order = MEMBERSHIP_PRIORITY[membership.membershipType] || 99;

    if (!current || order < current.order) {
      membershipMap[supplierId] = {
        order,
        membershipType: membership.membershipType,
        membershipStatus: membership.membershipStatus,
        endDate: membership.endDate,
      };
    }
  }

  // ALL INDIA: IDENTIFY DELHI SUPPLIERS
  const delhiSupplierSet = isAllIndia
    ? new Set(await getSupplierIds(DELHI_CITIES))
    : new Set();

  // SORT BY LOCATION FIRST, MEMBERSHIP SECOND
  products.sort((a, b) => {
    const aId = String(a.supplierId);
    const bId = String(b.supplierId);

    if (isAllIndia) {
      const aLocationPriority = delhiSupplierSet.has(aId) ? 0 : 1;
      const bLocationPriority = delhiSupplierSet.has(bId) ? 0 : 1;

      if (aLocationPriority !== bLocationPriority) {
        return aLocationPriority - bLocationPriority;
      }
    }

    const aMembership = membershipMap[aId]?.order || 99;
    const bMembership = membershipMap[bId]?.order || 99;

    if (aMembership !== bMembership) {
      return aMembership - bMembership;
    }

    return aId.localeCompare(bId);
  });

  // PAGINATION
  const totalProducts = products.length;
  const paginated = products.slice(skip, skip + limit);

  const supplierIdsPage = paginated.map((p) => p.supplierId);
  const productIds = paginated.map((p) => p._id);

  // FETCH SUPPLIER DETAILS
  const [allMedia, allUsers, allBusinesses, allWebpages] =
    await Promise.all([
      ProductMedia.find({
        productId: { $in: productIds },
      }).lean(),

      User.find({
        _id: { $in: supplierIdsPage },
      })
        .select("name email phone profileImage")
        .lean(),

      Business.find({
        userId: { $in: supplierIdsPage },
      }).lean(),

      Webpage.find({
        userId: { $in: supplierIdsPage },
      }).lean(),
    ]);

  // LOOKUP MAPS
  const mediaMap = {};

  for (const media of allMedia) {
    const id = String(media.productId);

    if (!mediaMap[id]) mediaMap[id] = [];
    mediaMap[id].push(media);
  }

  const userMap = Object.fromEntries(
    allUsers.map((u) => [String(u._id), u])
  );

  const businessMap = Object.fromEntries(
    allBusinesses.map((b) => [String(b.userId), b])
  );

  const webpageMap = Object.fromEntries(
    allWebpages.map((w) => [String(w.userId), w])
  );

  // FINAL PRODUCTS
  const final = paginated.map((product) => {
    const supplierId = String(product.supplierId);

    return {
      ...product,
      media: mediaMap[String(product._id)] || [],
      supplier: {
        ...(userMap[supplierId] || {}),
        membership: membershipMap[supplierId] || {
          membershipType: "normal",
        },
        business: businessMap[supplierId] || null,
        webpage: webpageMap[supplierId] || null,
      },
    };
  });

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
    fallbackApplied,
    fallbackLocation: fallbackApplied ? "Delhi" : null,

    page,
    limit,
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    products: final,
  };
};



export const createCategory = async ({ name, metaTitle, metaDescription, imageAlt, categoryDescription, citymetaTitle, citymetaDescription, industryId, parentCategoryId, faqs, file, }) => {
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
    citymetaTitle,
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