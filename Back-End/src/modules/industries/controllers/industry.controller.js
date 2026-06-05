import { getAllIndustriesService, getIndustryBySlugService, getIndustryTreeService } from "../services/industry.service.js";

export const getAllIndustries = async (req, res) => {
    try {
        const industries = await getAllIndustriesService();

        return res.status(200).json({
            success: true,
            count: industries.length,
            data: industries,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch industries",
        });
    }
};

export const getIndustryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const industry = await getIndustryBySlugService(slug);

        if (!industry) {
            return res.status(404).json({
                success: false,
                message: "Industry not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: industry,
        });
    } catch (error) {
        console.error("Get Industry Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getIndustryTree = async (req, res) => {
  try {
    const data = await getIndustryTreeService();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch industry tree",
    });
  }
};