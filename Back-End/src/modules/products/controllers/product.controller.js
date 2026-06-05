import { getProductBySlugService } from "../services/product.service.js";

export const getProductBySlug = async (req, res) => {
    try {
        const data = await getProductBySlugService(req.params.slug);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};