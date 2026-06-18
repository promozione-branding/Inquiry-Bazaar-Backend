import { getCurrentUser } from "../services/dirUser.service.js";

export const getMe = async (req, res) => {
    try {
        const token = req.cookies?.inquiry_bazaar_token;
        const result = await getCurrentUser(token);

        if (result.clearCookie) {
            res.clearCookie(
                "inquiry_bazaar_token",
                { path: "/", }
            );
        }

        return res.status(result.status)
            .json({ user: result.user, });

    } catch (error) {
        return res.status(401).json({
            user: null,
        });
    }
};