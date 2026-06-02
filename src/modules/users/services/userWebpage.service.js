import Webpage from "../models/userWebpage.model.js";
import Business from "../models/userBusiness.model.js";
import Product from "../../products/models/product.model.js";
import ProductMedia from "../../products/models/productMedia.model.js";

export const getWebpageBySlugService = async (slug) => {
    const webpage = await Webpage.findOne({ slug })
        .populate({ path: "userId", select: "name email phone otherEmail otherPhone profileImage", }).lean();

    if (!webpage) { return null; }
    const business = await Business.findOne({ userId: webpage.userId._id, }).lean();

    const products = await Product.find({ supplierId: webpage.userId._id, })
        .sort({ createdAt: -1 }).limit(8).lean();

    const productsWithMedia = await Promise.all(products.map(async (product) => {
        const media = await ProductMedia.find({ productId: product._id, }).sort({ isPrimary: -1 }).lean();
        return { ...product, media, };
    })
    );

    return {
        ...webpage,
        user: { ...webpage.userId, business, },
        products: productsWithMedia,
    };
};