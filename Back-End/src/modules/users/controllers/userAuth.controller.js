import { changeAdminPasswordService, getAdminSettingsService, loginService, updateAdminProfileService } from "../services/userAuth.service.js";

export const adminLogin = async (req, res) => {
  try {
    const result = await loginService({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers["user-agent"] || "",
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
    });

    res.cookie("inquiry_bazaar_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

const getAdminId = (req) => req.user?._id;

const sendError = (res, error) => {
  console.error("Admin settings error:", error);

  const status = error.code === 11000
    ? 409
    : error.statusCode || 500;

  return res.status(status).json({
    success: false,
    message:
      error.code === 11000
        ? "Email already registered"
        : status === 500
          ? "Something went wrong"
          : error.message,
  });
};

// Optional: reuse this in your existing adminMe controller
export const getAdminSettings = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const admin = await getAdminSettingsService(adminId);

    return res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// UPDATE ADMIN PROFILE
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const admin = await updateAdminProfileService(
      adminId,
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: admin,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// CHANGE ADMIN PASSWORD
export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = getAdminId(req);

    const result = await changeAdminPasswordService(
      adminId,
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};