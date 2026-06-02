import { globalSearchService, searchPageService } from "../services/search.service.js";

export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        const data = await globalSearchService(q);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Search failed",
        });
    }
};

export const getSearchPage = async (req, res) => {
    try {
        const { slug } = req.params;

        const data = await searchPageService(slug);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Not Found",
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
            message: "Server Error",
        });
    }
};