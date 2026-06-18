import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/userSession.model.js";

export const getCurrentUser = async (token) => {
    // Exit fast
    if (!token) {
        return {
            status: 401,
            user: null,
            clearCookie: false,
        };
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [session, user] = await Promise.all([
        Session.findById(decoded.sessionId),

        User.findById(decoded.id)
            .select("-password").lean(),
    ]);

    if (!session) {
        return {
            status: 401,
            user: null,
            clearCookie: true,
        };
    }

    return {
        status: 200,
        user,
        clearCookie: false,
    };
};