import Industry from "../../industries/models/industry.model.js";
import Category from "../../categories/models/category.model.js";
import Product from "../../products/models/product.model.js";
import ProductMedia from "../../products/models/productMedia.model.js";
import Business from "../../users/models/userBusiness.model.js";
import User from "../../users/models/user.model.js";
import Webpage from "../../users/models/userWebpage.model.js";

export const globalSearchService = async (query) => {
    const regex = new RegExp(query, "i");

    const [industries, categories, products] = await Promise.all([
        Industry.find({
            $or: [{ name: regex }, { slug: regex }]
        })
            .select("name slug imageUrl")
            .limit(10)
            .lean(),

        Category.find({
            $or: [{ name: regex }, { slug: regex }]
        })
            .select("name slug imageUrl parentCategoryId industryId")
            .populate("parentCategoryId", "name slug")
            .populate("industryId", "name slug")
            .limit(20)
            .lean(),

        Product.find({
            $or: [{ name: regex }, { slug: regex }]
        })
            .select("name slug categoryId subCategoryId")
            .populate("categoryId", "name slug")
            .populate("subCategoryId", "name slug")
            .limit(20)
            .lean()
    ]);

    return {
        industries,
        categories,
        products,
    };
};

const attachSupplierAndMedia = async (products) => {
    const productIds = products.map((p) => p._id);

    const supplierIds = [...new Set(products.map((p) => p.supplierId?._id?.toString())),];

    const [media, businesses, webpages] = await Promise.all([
        ProductMedia.find({ productId: { $in: productIds }, }).lean(),
        Business.find({ userId: { $in: supplierIds }, }).lean(),
        Webpage.find({ userId: { $in: supplierIds }, }).lean(),
    ]);

    return products.map((product) => {
        const business = businesses.find((b) => b.userId.toString() === product.supplierId?._id?.toString());
        const webpage = webpages.find((w) => w.userId.toString() === product.supplierId?._id?.toString());

        return {
            ...product, supplier: { ...product.supplierId, business, webpage },
            media: media.filter((m) => m.productId.toString() === product._id.toString()),
        };
    });
};

export const searchPageService = async (slug) => {
    // INDUSTRY PAGE
    const industry = await Industry.findOne({ slug }).lean();

    if (industry) {
        const categories = await Category.find({ industryId: industry._id, }).lean();

        let products = await Product.find({
            categoryId: { $in: categories.map((c) => c._id), },
        }).populate({ path: "supplierId", select: "name phone email business", })
            .populate("categoryId", "name slug")
            .populate("subCategoryId", "name slug")
            .lean();

        products = await attachSupplierAndMedia(products);
        return {
            type: "industry",
            title: industry.name,
            industry,
            categories,
            products,
        };
    }

    // CATEGORY / SUBCATEGORY PAGE
    const category = await Category.findOne({ slug })
        .populate("industryId", "name slug")
        .populate("parentCategoryId", "name slug").lean();

    if (category) {
        const subCategories = await Category.find({ parentCategoryId: category._id, }).lean();

        let products = await Product.find({
            $or: [
                { categoryId: category._id },
                { subCategoryId: category._id },
            ],
        }).populate({ path: "supplierId", select: "name phone email business", })
            .populate("categoryId", "name slug")
            .populate("subCategoryId", "name slug")
            .lean();

        products = await attachSupplierAndMedia(products);
        return {
            type: "category",
            title: category.name,
            category: {
                ...category,
                industry: category.industryId,
                parentCategory: category.parentCategoryId,
            },
            subCategories,
            products,
        };
    }

    // PRODUCT PAGE
    let product = await Product.findOne({ slug })
        .populate({ path: "supplierId", select: "name phone email business", })
        .populate("categoryId", "name slug")
        .populate("subCategoryId", "name slug").lean();

    if (product) {
        let relatedProducts = await Product.find({ categoryId: product.categoryId._id, _id: { $ne: product._id }, })
            .populate({ path: "supplierId", select: "name phone email business", })
            .populate("categoryId", "name slug")
            .populate("subCategoryId", "name slug")
            .limit(20).lean();

        const allProducts = await attachSupplierAndMedia([product, ...relatedProducts,]);

        return {
            type: "product",
            title: product.name,
            products: allProducts,
        };
    }

    return null;
};