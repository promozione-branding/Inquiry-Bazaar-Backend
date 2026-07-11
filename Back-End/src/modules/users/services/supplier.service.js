import User from "../models/user.model.js";
import Business from "../models/userBusiness.model.js";
import Membership from "../models/userMembership.model.js";

export const getAllSuppliersService = async ({ page, limit, search, city, membershipType, dateFilter = "all", }) => {
  const skip = (page - 1) * limit;
  // console.log("page", page, limit)h
  let businessUserIds = null;

  // City Filter
  if (city) {
    const businesses = await Business.find({ city, }).select("userId");
    businessUserIds = businesses.map((b) => b.userId);
  }

  // Membership Filter
  let membershipUserIds = null;
  if (membershipType) {
    const memberships = await Membership.find({ membershipType: membershipType.toLowerCase(), }).select("supplierId");
    membershipUserIds = memberships.map((m) => m.supplierId);
  }

  // User Query
  const query = { role: "supplier", };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i", }, },
      { email: { $regex: search, $options: "i", }, },
      { phone: { $regex: search, $options: "i", }, },
    ];
  }

  const andConditions = [];
  if (businessUserIds) {
    andConditions.push({ _id: { $in: businessUserIds, }, });
  }

  if (membershipUserIds) {
    andConditions.push({ _id: { $in: membershipUserIds, }, });
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  const now = new Date();

  if (dateFilter !== "all") {
    switch (dateFilter) {
      case "today": {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        query.createdAt = {
          $gte: start,
        };
        break;
      }

      case "yesterday": {
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        query.createdAt = {
          $gte: start,
          $lte: end,
        };
        break;
      }

      case "7days": {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);

        query.createdAt = {
          $gte: start,
        };
        break;
      }

      case "30days": {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);

        query.createdAt = {
          $gte: start,
        };
        break;
      }
    }
  }

  const total = await User.countDocuments(query);

  const suppliers = await User.find(query)
    .select("-password").sort({ createdAt: -1, })
    .skip(skip).limit(limit).lean();

  const supplierIds = suppliers.map((i) => i._id);
  const businesses = await Business.find({ userId: { $in: supplierIds, }, }).lean();
  const memberships = await Membership.find({ supplierId: { $in: supplierIds, }, }).lean();

  const businessMap = {};
  businesses.forEach((b) => { businessMap[b.userId.toString()] = b; });

  const membershipMap = {};
  memberships.forEach((m) => { membershipMap[m.supplierId.toString()] = m; });

  const data = suppliers.map((supplier) => ({
    ...supplier,
    business: businessMap[supplier._id.toString()] || null,
    membership: membershipMap[supplier._id.toString()] || null,
  }));

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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