import Webpage from "../models/userWebpage.model.js";
import Business from "../models/userBusiness.model.js";

export const getWebpageBySlugService = async (slug) => {
    const webpage = await Webpage.findOne({ slug })
        .populate({ path: "userId", select: "name email phone otherEmail otherPhone profileImage", }).lean();

    if (!webpage) { return null; }
    const business = await Business.findOne({ userId: webpage.userId._id, }).lean();

    return {
        ...webpage,
        user: { ...webpage.userId, business, },
    };
};