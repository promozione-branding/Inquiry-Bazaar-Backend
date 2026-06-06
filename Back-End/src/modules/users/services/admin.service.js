import User from "../models/user.model.js";
import Business from "../models/userBusiness.model.js";

export const getAllSuppliersService = async () => {
  const suppliers = await User.find({ role: "supplier", })
    .select("-password").sort({ createdAt: -1 }).lean();

  const suppliersWithBusiness = await Promise.all(
    suppliers.map(async (supplier) => {
      const business = await Business.findOne({ userId: supplier._id, }).lean();
      return { ...supplier, business, };
    })
  );

  return suppliersWithBusiness;
};

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