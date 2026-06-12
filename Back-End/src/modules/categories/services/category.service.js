import Category from "../models/category.model.js";
import Product from "../../products/models/product.model.js";
import ProductMedia from "../../products/models/productMedia.model.js";
import User from "../../users/models/user.model.js";
import Business from "../../users/models/userBusiness.model.js";
import Webpage from "../../users/models/userWebpage.model.js";

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

export const getSubCategoryLocationDetailsService = async (slug, location) => {
  const category = await Category.findOne({ slug, })
    .populate("industryId", "name slug")
    .populate("parentCategoryId", "name slug").lean();

  if (!category) { return null; }
  const selectedCity = cityCoordinates[location];

  if (!selectedCity) {
    throw new Error("Invalid city");
  }

  const nearbyCities = Object.keys(cityCoordinates).filter((city) => {
    const distance = getDistance(
      selectedCity.lat,
      selectedCity.lng,
      cityCoordinates[city].lat,
      cityCoordinates[city].lng
    );

    return distance <= 200;
  });

  const supplierIds = await Business.find({ serviceLocations: { $in: nearbyCities, }, }).distinct("userId");

  // const supplierIds = await Business.find({ serviceLocations: { $in: [location], }, }).distinct("userId");

  const products = await Promise.all(
    supplierIds.map(async (supplierId) => {
      const supplierProducts = await Product.aggregate([
        {
          $match: {
            supplierId,
            $or: [
              { subCategoryId: category._id },
              { categoryId: category._id },
            ],
          },
        },
        {
          $sample: { size: 1 }, // random product
        },
      ]);

      return supplierProducts[0] || null;
    })
  );

  const filteredProducts = products.filter(Boolean);

  const finalProducts = await Promise.all(
    filteredProducts.map(async (product) => {
      const [media, supplier, business, webpage,] = await Promise.all([
        ProductMedia.find({ productId: product._id, }).lean(),
        User.findById(product.supplierId).select("name email phone profileImage").lean(),
        Business.findOne({ userId: product.supplierId, }).lean(),
        Webpage.findOne({ userId: product.supplierId, }).lean(),
      ]);

      return {
        ...product,
        media,
        supplier: supplier ? { ...supplier, business, webpage, } : null,
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
    location,
    totalProducts: finalProducts.length,
    products: finalProducts,
  };
};

export const cityCoordinates = {
  Delhi: { lat: 28.7041, lng: 77.1025 },
  "New Delhi": { lat: 28.6139, lng: 77.2090 },
  Noida: { lat: 28.5355, lng: 77.3910 },
  "Greater Noida": { lat: 28.4744, lng: 77.5040 },
  Ghaziabad: { lat: 28.6692, lng: 77.4538 },
  Faridabad: { lat: 28.4089, lng: 77.3178 },
  Gurugram: { lat: 28.4595, lng: 77.0266 },
  Kundli: { lat: 28.9977, lng: 77.0410 },
  Sonipat: { lat: 28.9931, lng: 77.0151 },
  Rohtak: { lat: 28.8955, lng: 76.6066 },
  Meerut: { lat: 28.9845, lng: 77.7064 },
  Panipat: { lat: 29.3909, lng: 76.9635 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Ajmer: { lat: 26.4499, lng: 74.6399 },
  Jodhpur: { lat: 26.2389, lng: 73.0243 },
  Udaipur: { lat: 24.5854, lng: 73.7125 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Ludhiana: { lat: 30.9010, lng: 75.8573 },
  Amritsar: { lat: 31.6340, lng: 74.8723 },
  Shimla: { lat: 31.1048, lng: 77.1734 },
  Baddi: { lat: 30.9578, lng: 76.7914 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mysuru: { lat: 12.2958, lng: 76.6394 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Warangal: { lat: 17.9689, lng: 79.5941 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Gwalior: { lat: 26.2183, lng: 78.1828 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Durgapur: { lat: 23.5204, lng: 87.3119 },
  Patna: { lat: 25.5941, lng: 85.1376 },
  Muzaffarpur: { lat: 26.1209, lng: 85.3647 },
  Bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  Cuttack: { lat: 20.4625, lng: 85.8830 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Vijayawada: { lat: 16.5062, lng: 80.6480 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Raipur: { lat: 21.2514, lng: 81.6296 },
  Bhilai: { lat: 21.1938, lng: 81.3509 },
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Jamshedpur: { lat: 22.8046, lng: 86.2029 },
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Dibrugarh: { lat: 27.4728, lng: 94.9120 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Haridwar: { lat: 29.9457, lng: 78.1642 },
  Srinagar: { lat: 34.0837, lng: 74.7973 },
  Jammu: { lat: 32.7266, lng: 74.8570 },
  Goa: { lat: 15.2993, lng: 74.1240 },
  Lucknow: { lat: 26.8467, lng: 80.9462, },
  Kanpur: { lat: 26.4499, lng: 80.3319, },
  Varanasi: { lat: 25.3176, lng: 82.9739, },
  Agra: { lat: 27.1767, lng: 78.0081, },
  Alwar: { lat: 27.5530, lng: 76.6346, },
};