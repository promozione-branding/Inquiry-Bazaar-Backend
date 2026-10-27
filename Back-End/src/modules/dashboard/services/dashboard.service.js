
import User from "../../users/models/user.model.js";
import Category from "../../categories/models/category.model.js";
import Industry from "../../industries/models/industry.model.js";
import Product from "../../products/models/product.model.js";
import Help from "../../help/models/help.model.js";

const getDateRange = (filter) => {
    const now = new Date();

    // Date filters use UTC. Use the same timezone
    // on the leads API for exact cross-system comparisons.
    const today = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
        )
    );

    if (filter === "all") {
        return { start: null, end: null };
    }

    if (filter === "today") {
        return { start: today, end: null };
    }

    if (filter === "yesterday") {
        const start = new Date(today);
        start.setUTCDate(start.getUTCDate() - 1);

        return { start, end: today };
    }

    const days = filter === "30days" ? 30 : 7;
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    return { start, end: null };
};

const getDateMatch = (range) => {
    const createdAt = {};

    if (range.start) createdAt.$gte = range.start;
    if (range.end) createdAt.$lt = range.end;

    return Object.keys(createdAt).length
        ? { createdAt }
        : {};
};

const getGrowth = async (Model, match, role = null) => {
    const query = role
        ? { ...match, role }
        : match;

    return Model.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: "UTC",
                    },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
};

const formatGrowth = (rows) =>
    rows.map((row) => ({
        date: row._id,
        count: row.count,
    }));

export const getAdminDashboardService = async (
    filter = "7days"
) => {
    const range = getDateRange(filter);
    const dateMatch = getDateMatch(range);

    const [
        totalSellers,
        totalBuyers,
        totalCategories,
        totalIndustries,
        totalProducts,
        totalTickets,

        filteredSellers,
        filteredBuyers,
        filteredCategories,
        filteredIndustries,
        filteredProducts,
        filteredTickets,

        openTickets,
        inProgressTickets,
        resolvedTickets,

        sellerGrowth,
        buyerGrowth,
        productGrowth,
        categoryGrowth,

        recentSellers,
        recentProducts,
        recentTickets,

        topCategories,
        topIndustries,
    ] = await Promise.all([
        // Overall counts
        User.countDocuments({ role: "supplier" }),
        User.countDocuments({ role: "buyer" }),
        Category.countDocuments(),
        Industry.countDocuments(),
        Product.countDocuments(),
        Help.countDocuments(),

        // Filtered counts
        User.countDocuments({
            role: "supplier",
            ...dateMatch,
        }),
        User.countDocuments({
            role: "buyer",
            ...dateMatch,
        }),
        Category.countDocuments(dateMatch),
        Industry.countDocuments(dateMatch),
        Product.countDocuments(dateMatch),
        Help.countDocuments(dateMatch),

        // Support ticket status (filtered)
        Help.countDocuments({
            ...dateMatch,
            status: "OPEN",
        }),
        Help.countDocuments({
            ...dateMatch,
            status: "IN PROGRESS",
        }),
        Help.countDocuments({
            ...dateMatch,
            status: "RESOLVED",
        }),

        // Growth charts
        getGrowth(User, dateMatch, "supplier"),
        getGrowth(User, dateMatch, "buyer"),
        getGrowth(Product, dateMatch),
        getGrowth(Category, dateMatch),

        // Recent records
        User.find({ role: "supplier", ...dateMatch })
            .select("name email phone createdAt")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),

        Product.find(dateMatch)
            .select("name price supplierId categoryId createdAt")
            .populate("supplierId", "name")
            .populate("categoryId", "name")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),

        Help.find(dateMatch)
            .select("subject issueType status userId createdAt")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),

        // Most-used product categories
        Product.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: "$categoryId",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 6 },
            {
                $lookup: {
                    from: Category.collection.name,
                    localField: "_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $ifNull: [
                            { $arrayElemAt: ["$category.name", 0] },
                            "Unknown",
                        ],
                    },
                    count: 1,
                },
            },
        ]),

        // Industries with most categories
        Category.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: "$industryId",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 6 },
            {
                $lookup: {
                    from: Industry.collection.name,
                    localField: "_id",
                    foreignField: "_id",
                    as: "industry",
                },
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $ifNull: [
                            { $arrayElemAt: ["$industry.name", 0] },
                            "Unknown",
                        ],
                    },
                    count: 1,
                },
            },
        ]),
    ]);

    // Merge growth datasets by date
    const growthMap = new Map();

    const mergeGrowth = (rows, key) => {
        for (const row of rows) {
            if (!growthMap.has(row._id)) {
                growthMap.set(row._id, {
                    date: row._id,
                    sellers: 0,
                    buyers: 0,
                    products: 0,
                    categories: 0,
                });
            }

            growthMap.get(row._id)[key] = row.count;
        }
    };

    mergeGrowth(sellerGrowth, "sellers");
    mergeGrowth(buyerGrowth, "buyers");
    mergeGrowth(productGrowth, "products");
    mergeGrowth(categoryGrowth, "categories");

    // Fill missing days for finite date ranges
    if (range.start) {
        const cursor = new Date(range.start);
        const end = range.end || new Date();

        while (cursor < end) {
            const key = cursor.toISOString().slice(0, 10);

            if (!growthMap.has(key)) {
                growthMap.set(key, {
                    date: key,
                    sellers: 0,
                    buyers: 0,
                    products: 0,
                    categories: 0,
                });
            }

            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
    }

    const growth = [...growthMap.values()].sort(
        (a, b) => a.date.localeCompare(b.date)
    );

    return {
        filter,

        totals: {
            sellers: totalSellers,
            buyers: totalBuyers,
            categories: totalCategories,
            industries: totalIndustries,
            products: totalProducts,
            tickets: totalTickets,
        },

        filtered: {
            sellers: filteredSellers,
            buyers: filteredBuyers,
            categories: filteredCategories,
            industries: filteredIndustries,
            products: filteredProducts,
            tickets: filteredTickets,
        },

        ticketStatus: [
            { name: "Open", value: openTickets },
            { name: "In Progress", value: inProgressTickets },
            { name: "Resolved", value: resolvedTickets },
        ],

        userDistribution: [
            { name: "Sellers", value: filteredSellers },
            { name: "Buyers", value: filteredBuyers },
        ],

        growth,
        topCategories,
        topIndustries,

        recent: {
            sellers: recentSellers,
            products: recentProducts,
            tickets: recentTickets,
        },
    };
};
