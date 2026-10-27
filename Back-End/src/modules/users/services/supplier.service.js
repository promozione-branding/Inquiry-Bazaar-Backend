import User from "../models/user.model.js";
import Business from "../models/userBusiness.model.js";
import Membership from "../models/userMembership.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

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

const USER_FIELDS = [
  "name",
  "email",
  "phone",
  "otherEmail",
  "otherPhone",
  "profileImage",
];

const BUSINESS_FIELDS = [
  "companyName",
  "ceoName",
  "gstNumber",
  "establishedDate",
  "ownershipType",
  "businessType",
  "businessField",
  "annualTurnover",
  "numberOfEmployees",
  "address",
  "city",
  "state",
];

const SOCIAL_FIELDS = [
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "telegram",
  "whatsapp",
  "twitter",
];

const errorWithStatus = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const pickFields = (source, fields) => {
  const result = {};

  for (const field of fields) {
    if (
      Object.prototype.hasOwnProperty.call(source, field)
    ) {
      result[field] = source[field];
    }
  }

  return result;
};

export const updateSupplierByIdService = async (id, payload) => {
  if (!mongoose.isValidObjectId(id)) {
    throw errorWithStatus("Invalid supplier ID");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw errorWithStatus("Invalid request body");
  }

  const supplier = await User.findOne({ _id: id, role: "supplier", });
  if (!supplier) return null;

  const userUpdates = pickFields(payload, USER_FIELDS);

  // Validate and normalize user fields
  for (const [key, value] of Object.entries(userUpdates)) {
    if (typeof value !== "string") {
      throw errorWithStatus(`${key} must be a string`);
    }

    userUpdates[key] = value.trim();
  }

  if ("name" in userUpdates && !userUpdates.name) {
    throw errorWithStatus("Name is required");
  }

  if ("email" in userUpdates) {
    userUpdates.email = userUpdates.email.toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userUpdates.email)) {
      throw errorWithStatus("Invalid email address");
    }

    const exists = await User.exists({
      email: userUpdates.email,
      _id: { $ne: supplier._id },
    });

    if (exists) {
      throw errorWithStatus("Email already exists", 409);
    }
  }

  // Optional password update
  if (
    payload.newPassword !== undefined &&
    payload.newPassword !== ""
  ) {
    if (
      typeof payload.newPassword !== "string" ||
      payload.newPassword.length < 10 ||
      Buffer.byteLength(payload.newPassword, "utf8") > 72
    ) {
      throw errorWithStatus(
        "Password must be 10-72 UTF-8 bytes"
      );
    }

    userUpdates.password = await bcrypt.hash(payload.newPassword, 10);
  }

  // Business fields
  const businessInput =
    payload.business === undefined
      ? null
      : payload.business;

  if (
    businessInput !== null &&
    (
      typeof businessInput !== "object" ||
      Array.isArray(businessInput)
    )
  ) {
    throw errorWithStatus("Invalid business data");
  }

  const businessUpdates = businessInput
    ? pickFields(businessInput, BUSINESS_FIELDS)
    : {};

  for (const [key, value] of Object.entries(
    businessUpdates
  )) {
    if (key === "establishedDate") {
      if (value === "" || value === null) {
        businessUpdates[key] = null;
      } else {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          throw errorWithStatus(
            "Invalid established date"
          );
        }

        businessUpdates[key] = date;
      }
    } else {
      if (typeof value !== "string") {
        throw errorWithStatus(
          `${key} must be a string`
        );
      }

      businessUpdates[key] = value.trim();
    }
  }

  if (
    "city" in businessUpdates &&
    !businessUpdates.city
  ) {
    throw errorWithStatus("Business city is required");
  }

  if ("gstNumber" in businessUpdates) {
    businessUpdates.gstNumber =
      businessUpdates.gstNumber.toUpperCase();
  }

  // Social links
  if (businessInput?.social !== undefined) {
    if (
      !businessInput.social ||
      typeof businessInput.social !== "object" ||
      Array.isArray(businessInput.social)
    ) {
      throw errorWithStatus("Invalid social links");
    }

    const socialUpdates = pickFields(
      businessInput.social,
      SOCIAL_FIELDS
    );

    for (const [key, value] of Object.entries(
      socialUpdates
    )) {
      if (typeof value !== "string") {
        throw errorWithStatus(
          `${key} must be a string`
        );
      }

      const trimmed = value.trim();

      if (trimmed) {
        let url;

        try {
          url = new URL(trimmed);
        } catch {
          throw errorWithStatus(
            `Invalid ${key} URL`
          );
        }

        if (
          !["https:", "http:"].includes(
            url.protocol
          )
        ) {
          throw errorWithStatus(
            `Invalid ${key} URL`
          );
        }
      }

      businessUpdates[`social.${key}`] = trimmed;
    }
  }

  // Validate updates before writing
  const userToValidate = new User({
    ...supplier.toObject(),
    ...userUpdates,
  });

  await userToValidate.validate();

  let existingBusiness = null;

  if (Object.keys(businessUpdates).length > 0) {
    existingBusiness = await Business.findOne({
      userId: supplier._id,
    });

    if (!existingBusiness) {
      throw errorWithStatus(
        "Supplier business record not found",
        404
      );
    }

    const businessToValidate = new Business(
      existingBusiness.toObject()
    );

    businessToValidate.set(businessUpdates);
    await businessToValidate.validate();
  }

  // Atomic update across both collections
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (Object.keys(userUpdates).length > 0) {
        await User.updateOne(
          {
            _id: supplier._id,
            role: "supplier",
          },
          { $set: userUpdates },
          { session, runValidators: true }
        );
      }

      if (Object.keys(businessUpdates).length > 0) {
        await Business.updateOne(
          { userId: supplier._id },
          { $set: businessUpdates },
          { session, runValidators: true }
        );
      }
    });
  } finally {
    await session.endSession();
  }

  const [updatedUser, updatedBusiness] =
    await Promise.all([
      User.findOne({
        _id: supplier._id,
        role: "supplier",
      })
        .select("-password")
        .lean(),

      Business.findOne({
        userId: supplier._id,
      }).lean(),
    ]);

  return {
    ...updatedUser,
    business: updatedBusiness,
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