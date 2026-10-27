import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Session from "../models/userSession.model.js";

export const loginService = async ({ email, password, userAgent, ip, }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  // Admin Only
  if (user.role !== "admin") {
    throw new Error("Access denied");
  }

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser().name || "Unknown";
  const os = parser.getOS().name || "Unknown";
  const deviceType = parser.getDevice().type || "desktop";
  const deviceName = `${browser} on ${os}`;

  const session = await Session.create({
    userId: user._id,
    browser,
    os,
    deviceType,
    deviceName,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      sessionId: session._id,
    },
    process.env.JWT_SECRET, { expiresIn: "7d", }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const publicFields =
  "name email phone otherEmail otherPhone profileImage role createdAt updatedAt";

const getAdmin = async (adminId, includePassword = false) => {
  if (!mongoose.isValidObjectId(adminId)) {
    throw createError("Invalid admin session", 401);
  }

  const query = User.findOne({
    _id: adminId,
    role: "admin",
  });

  if (!includePassword) {
    query.select(publicFields);
  }

  const admin = await query;

  if (!admin) {
    throw createError("Admin account not found", 404);
  }

  return admin;
};

export const getAdminSettingsService = async (adminId) => {
  const admin = await getAdmin(adminId);

  return admin.toObject();
};

export const updateAdminProfileService = async (
  adminId,
  payload
) => {
  const admin = await getAdmin(adminId);

  const allowedFields = [
    "name",
    "email",
    "phone",
    "otherEmail",
    "otherPhone",
    "profileImage",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(payload, field)
    ) {
      if (typeof payload[field] !== "string") {
        throw createError(`${field} must be a string`);
      }

      updates[field] = payload[field].trim();
    }
  }

  if ("name" in updates && !updates.name) {
    throw createError("Name is required");
  }

  if ("email" in updates) {
    updates.email = updates.email.toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        updates.email
      )
    ) {
      throw createError("Invalid email address");
    }

    const exists = await User.exists({
      email: updates.email,
      _id: { $ne: adminId },
    });

    if (exists) {
      throw createError(
        "Email already registered",
        409
      );
    }
  }

  if ("phone" in updates && updates.phone) {
    if (!/^[6-9]\d{9}$/.test(updates.phone)) {
      throw createError(
        "Phone must be a valid 10-digit Indian mobile number"
      );
    }
  }

  if ("otherPhone" in updates && updates.otherPhone) {
    if (!/^[6-9]\d{9}$/.test(updates.otherPhone)) {
      throw createError(
        "Alternate phone must be a valid 10-digit Indian mobile number"
      );
    }
  }

  if ("otherEmail" in updates && updates.otherEmail) {
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        updates.otherEmail
      )
    ) {
      throw createError("Invalid alternate email");
    }
  }

  if ("profileImage" in updates && updates.profileImage) {
    let parsed;

    try {
      parsed = new URL(updates.profileImage);
    } catch {
      throw createError("Invalid profile image URL");
    }

    if (
      !["https:", "http:"].includes(parsed.protocol)
    ) {
      throw createError("Invalid profile image URL");
    }
  }

  admin.set(updates);

  await admin.save();

  return getAdminSettingsService(adminId);
};

export const changeAdminPasswordService = async (
  adminId,
  { currentPassword, newPassword }
) => {
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    !currentPassword ||
    !newPassword
  ) {
    throw createError(
      "Current password and new password are required"
    );
  }

  if (
    newPassword.length < 10 ||
    Buffer.byteLength(newPassword, "utf8") > 72
  ) {
    throw createError(
      "New password must be at least 10 characters and at most 72 UTF-8 bytes"
    );
  }

  if (currentPassword === newPassword) {
    throw createError(
      "New password must be different from current password"
    );
  }

  const admin = await getAdmin(adminId, true);

  if (!admin.password) {
    throw createError(
      "Password login is not configured for this admin account"
    );
  }

  const isValid = await bcrypt.compare(
    currentPassword,
    admin.password
  );

  if (!isValid) {
    throw createError(
      "Current password is incorrect",
      400
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  // Compare-and-set prevents overwriting a password
  // changed concurrently by another request.
  const result = await User.updateOne(
    {
      _id: admin._id,
      role: "admin",
      password: admin.password,
    },
    {
      $set: {
        password: hashedPassword,
      },
    }
  );

  if (result.modifiedCount !== 1) {
    throw createError(
      "Password was changed in another session. Please try again.",
      409
    );
  }

  return {
    message: "Password changed successfully",
  };
};