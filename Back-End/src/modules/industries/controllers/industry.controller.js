import { createIndustry, deleteIndustry, getAllIndustriesService, getIndustryById, getIndustryBySlugService, getIndustryTreeService, updateIndustry } from "../services/industry.service.js";

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

export const addIndustry = async (req, res) => {
    try {
        const { name, metaTitle, metaDescription, } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required", });
        }

        const industry = await createIndustry({
            name,
            metaTitle,
            metaDescription,
            file: req.file,
        });

        res.status(201).json(industry);
    } catch (error) {
        res.status(500).json({ message: error.message, });
    }
};

export const getIndustry = async (req, res) => {
    try {
        const data = await getIndustryById(req.params.id);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message, });
    }
};

export const editIndustry = async (req, res) => {
    try {
        const updated = await updateIndustry(req.params.id,
            { ...req.body, file: req.file, });

        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: error.message, });
    }
};

export const removeIndustry = async (req, res) => {
    try {
        await deleteIndustry(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Industry deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};