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

export const getSupplierByIdService = async (id) => {
  const supplier = await User.findOne({ _id: id, role: "supplier", })
    .select("-password").lean();

  if (!supplier) {
    return null;
  }

  const business = await Business.findOne({ userId: supplier._id, }).lean();

  return {
    ...supplier,
    business,
  };
};

export const addServiceLocationService = async (supplierId, city) => {
  return await Business.findOneAndUpdate(
    { userId: supplierId },
    { $addToSet: { serviceLocations: city, }, },
    { new: true, }
  );
};

export const removeServiceLocationService = async (supplierId, city) => {
  return await Business.findOneAndUpdate(
    { userId: supplierId },
    { $pull: { serviceLocations: city, }, },
    { new: true, }
  );
};