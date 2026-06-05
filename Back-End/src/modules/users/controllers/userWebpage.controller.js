import { getWebpageBySlugService } from "../services/userWebpage.service.js";

export const getWebpageBySlug = async (req, res) => {
    try {
        const data = await getWebpageBySlugService(req.params.slug);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Webpage not found",
            });
        }

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};