import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";

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