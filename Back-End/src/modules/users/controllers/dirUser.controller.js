import { getCurrentUser } from "../services/dirUser.service.js";

export const getMe = async (req, res) => {
    try {
        const token = req.cookies?.seller_inquiry_bazaar_token

        const result = await getCurrentUser(token);

        if (result.clearCookie) {
            res.clearCookie("seller_inquiry_bazaar_token", {
                domain: ".inquirybazaar.com",
                path: "/",
            });
        }

        return res.status(result.status).json({
            user: result.user,
        });

    } catch {
        return res.status(401).json({
            user: null,
        });
    }
};