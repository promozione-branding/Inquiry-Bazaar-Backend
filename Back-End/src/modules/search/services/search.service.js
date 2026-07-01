import Industry from "../../industries/models/industry.model.js";
import Category from "../../categories/models/category.model.js";
import Product from "../../products/models/product.model.js";
import ProductMedia from "../../products/models/productMedia.model.js";
import Business from "../../users/models/userBusiness.model.js";
import User from "../../users/models/user.model.js";
import Webpage from "../../users/models/userWebpage.model.js";
import { cityCoordinates } from "../../../utils/data.js";
import Membership from "../../users/models/userMembership.model.js";
import CategoryCoverage from "../../categories/models/categoryCoverage.model.js";

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

    // One random product per supplier
    const uniqueProducts = Object.values(
        products.reduce((acc, product) => {
            const supplierId = product.supplierId?._id?.toString();

            if (!supplierId) return acc;

            if (!acc[supplierId]) {
                acc[supplierId] = [];
            }

            acc[supplierId].push(product);

            return acc;
        }, {})
    ).map((supplierProducts) => {
        return supplierProducts[
            Math.floor(Math.random() * supplierProducts.length)
        ];
    });

    products = uniqueProducts;

    const productIds = products.map((p) => p._id);

    const supplierIds = [
        ...new Set(
            products.map((p) =>
                p.supplierId?._id?.toString()
            )
        ),
    ];

    const [media, businesses, webpages] = await Promise.all([
        ProductMedia.find({
            productId: { $in: productIds },
        }).lean(),

        Business.find({
            userId: { $in: supplierIds },
        }).lean(),

        Webpage.find({
            userId: { $in: supplierIds },
        }).lean(),
    ]);

    return products.map((product) => {
        const business = businesses.find(
            (b) =>
                b.userId.toString() ===
                product.supplierId?._id?.toString()
        );

        const webpage = webpages.find(
            (w) =>
                w.userId.toString() ===
                product.supplierId?._id?.toString()
        );

        return {
            ...product,
            supplier: {
                ...product.supplierId,
                business,
                webpage,
            },
            media: media.filter(
                (m) =>
                    m.productId.toString() ===
                    product._id.toString()
            ),
        };
    });
};

export const searchPageService = async (slug, location = "All India", page = 1, limit = 10) => {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;
    let nearbyCities = [];

    if (location === "India" || location === "All India") {
        nearbyCities = Object.keys(cityCoordinates);
    } else {
        const selected = cityCoordinates[location];
        if (!selected) {
            throw new Error("Invalid location");
        }

        nearbyCities = Object.keys(cityCoordinates).filter(city =>
            getDistance(
                selected.lat,
                selected.lng,
                cityCoordinates[city].lat,
                cityCoordinates[city].lng
            ) <= 200);
    }

    async function getSupplierIds(subCategoryId = null) {
        const normal = await Business.find({ serviceLocations: { $in: nearbyCities, }, }).distinct("userId");
        let coverage = [];

        if (subCategoryId) {
            coverage = await CategoryCoverage.find({
                subCategoryId,
                locations: { $in: nearbyCities, },
            }).distinct("supplierId");
        }

        return [...new Set([...normal, ...coverage,]),];
    }

    const membershipOrder = {
        elite: 1,
        pro: 2,
        growth: 3,
        starter: 4,
    };

    async function attach(products, selectedProduct = null) {
        if (!products.length) {
            return {
                page,
                limit,
                totalProducts: 0,
                totalPages: 0,
                products: [],
            };
        }

        // GROUP SUPPLIER
        const grouped = {};
        products.forEach(p => {
            const id = String(p.supplierId._id);
            if (!grouped[id]) {
                grouped[id] = [];
            }
            grouped[id].push(p);
        });

        // ONE PRODUCT PER SUPPLIER
        let unique = Object.values(grouped).map(items => {
            if (selectedProduct) {
                const exact = items.find(x => String(x._id) === String(selectedProduct));
                if (exact) {
                    return exact;
                }
            }

            return items[
                Math.floor(Math.random() * items.length)
            ];
        });

        const supplierIds = unique.map(x => x.supplierId._id);

        // MEMBERSHIP
        const memberships = await Membership.find({
            supplierId: { $in: supplierIds, },
            membershipStatus: "active",
        }).select(`supplierId membershipType membershipStatus startDate endDate`).lean();

        const membershipMap = Object.fromEntries(memberships.map(m => [String(m.supplierId), m,]));
        unique.sort((a, b) => (membershipOrder[membershipMap[String(a.supplierId._id)]?.membershipType] || 99)
            - (membershipOrder[membershipMap[String(b.supplierId._id)]?.membershipType] || 99)
        );

        const totalProducts = unique.length;
        const totalPages = Math.ceil(totalProducts / limit);
        unique = unique.slice(skip, skip + limit);
        const productIds = unique.map(x => x._id);
        const pagedSupplierIds = unique.map(x => x.supplierId._id);

        const [media, businesses, webpages,] = await Promise.all([
            ProductMedia.find({ productId: { $in: productIds, }, }).select("productId url type").lean(),
            Business.find({ userId: { $in: pagedSupplierIds, }, }).lean(),
            Webpage.find({ userId: { $in: pagedSupplierIds, }, }).lean(),
        ]);

        const mediaMap = {};
        media.forEach(m => {
            const id = String(m.productId);
            if (!mediaMap[id]) {
                mediaMap[id] = [];
            }
            mediaMap[id].push(m);
        });

        const businessMap = Object.fromEntries(
            businesses.map(x => [String(x.userId), x,])
        );

        const webpageMap = Object.fromEntries(webpages.map(x => [String(x.userId), x,]));

        return {
            page,
            limit,
            totalProducts,
            totalPages,
            products: unique.map(p => ({
                _id: p._id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                brandName: p.brandName,
                specifications: p.specifications,
                categoryId: p.categoryId,
                subCategoryId: p.subCategoryId,
                media: mediaMap[String(p._id)] || [],

                supplier: {
                    _id: p.supplierId._id,
                    name: p.supplierId.name,
                    email: p.supplierId.email,
                    phone: p.supplierId.phone,
                    profileImage: p.supplierId.profileImage,
                    membership: membershipMap[String(p.supplierId._id)] ||
                        { membershipType: "normal", membershipStatus: "inactive", },
                    business: businessMap[String(p.supplierId._id)] || null,
                    webpage: webpageMap[String(p.supplierId._id)] || null,
                },
            })),
        };
    }

    // ================= INDUSTRY =================
    const industry = await Industry.findOne({ slug, });
    if (industry) {
        const categories = await Category.find({ industryId: industry._id, }).select("_id");
        const supplierIds = await getSupplierIds();

        return {
            type: "industry",
            metaTitle: industry.metaTitle,
            metaTitle: industry.metaDescription,
            ...(await attach(
                await Product.find({ supplierId: { $in: supplierIds, }, categoryId: { $in: categories, }, })
                    .populate("supplierId", "name email phone profileImage")
                    .populate("categoryId").populate("subCategoryId").lean()
            )),
        };
    }

    // ================= CATEGORY =================
    const category = await Category.findOne({ slug, });
    if (category) {
        const supplierIds = await getSupplierIds(category._id);

        return {
            type: "category",
            metaTitle: category.metaTitle,
            metaDescription: category.metaDescription,
            faqs: category.faqs,
            categoryDescription: category.categoryDescription,
            ...(await attach(
                await Product.find({
                    supplierId: { $in: supplierIds, },
                    $or: [{ categoryId: category._id, }, { subCategoryId: category._id, },],
                }).populate("supplierId", "name email phone profileImage")
                    .populate("categoryId").populate("subCategoryId").lean()
            )),
        };
    }

    // ================= PRODUCT =================
    const searched = await Product.findOne({
        $or: [{ slug, }, { name: new RegExp(slug, "i"), },],
    });

    if (searched) {
        const supplierIds = await getSupplierIds(searched.subCategoryId);

        return {
            type: "product",
            metaTitle: searched.metaTitle || searched.name,
            metaDescription: searched.metaDescription || searched.description?.replace(/<[^>]+>/g, "")?.slice(0, 160),

            ...(await attach(await Product.find({
                supplierId: { $in: supplierIds, },
                subCategoryId: searched.subCategoryId,
            }).populate("supplierId", "name email phone profileImage")
                .populate("categoryId").populate("subCategoryId").lean(), searched._id)),
        };
    }
    return null;
};