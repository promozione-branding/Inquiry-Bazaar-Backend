import Webpage from "../models/userWebpage.model.js";
import Business from "../models/userBusiness.model.js";
import Product from "../../products/models/product.model.js";
import ProductMedia from "../../products/models/productMedia.model.js";

export const getWebpageBySlugService = async (slug) => {
    const webpage = await Webpage.findOne({ slug })
        .populate({ path: "featuredProducts.products", select: "name slug", })
        .populate({ path: "popularProducts.products", select: "name slug", })
        .populate({ path: "userId", select: "name email phone otherEmail otherPhone profileImage", })
        .lean();

    if (!webpage) return null;

    const business = await Business.findOne({ userId: webpage.userId._id, }).lean();

    // Get all featured + popular product ids
    const productIds = [
        ...(webpage.featuredProducts?.products || []).map(p => p._id),
        ...(webpage.popularProducts?.products || []).map(p => p._id),
    ];

    // Fetch media for those products
    const medias = await ProductMedia.find({ productId: { $in: productIds }, })
        .select("productId url type isPrimary")
        .sort({ isPrimary: -1 }).lean();

    // Group media by product
    const mediaMap = medias.reduce((acc, media) => {
        const key = media.productId.toString();
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(media);
        return acc;
    }, {});

    // Attach media to featured products
    webpage.featuredProducts.products = webpage.featuredProducts.products.map(product => ({
        ...product,
        media: mediaMap[product._id.toString()] || [],
    }));

    // Attach media to popular products
    webpage.popularProducts.products = webpage.popularProducts.products.map(product => ({
        ...product,
        media: mediaMap[product._id.toString()] || [],
    }));


    // OLD LOGIC (unchanged)
    const products = await Product.find({ supplierId: webpage.userId._id, })
        .sort({ createdAt: -1 }).limit(8).lean()
        .populate("categoryId", "name slug").populate("subCategoryId", "name slug");

    const productsWithMedia = await Promise.all(products.map(async (product) => {
        const media = await ProductMedia.find({ productId: product._id, })
            .sort({ isPrimary: -1 }).lean();

        return {
            ...product, media,
        };
    })
    );

    return {
        ...webpage,
        user: {
            ...webpage.userId, business,
        },
        products: productsWithMedia,
    };
};