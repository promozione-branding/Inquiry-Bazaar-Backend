import User from "../models/user.model.js";
import Business from "../models/userBusiness.model.js";

export const getAllBuyersService = async () => {
    const buyers = await User.find({ role: "buyer", })
        .select("-password").sort({ createdAt: -1 }).lean();

    const buyersWithBusiness = await Promise.all(
        buyers.map(async (buyer) => {
            const business = await Business.findOne({ userId: buyer._id, }).lean();
            return { ...buyer, business, };
        })
    );

    return buyersWithBusiness;
};