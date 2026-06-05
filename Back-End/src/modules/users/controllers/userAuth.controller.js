import { loginService } from "../services/userAuth.service.js";

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