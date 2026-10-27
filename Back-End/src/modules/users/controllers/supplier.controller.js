import { addServiceLocationService, getAllSuppliersService, getSupplierByIdService, removeServiceLocationService, updateSupplierByIdService } from "../services/supplier.service.js";
import mongoose from "mongoose";

export const getAllSuppliers = async (req, res) => {
    try {
        const { page = 1, limit = 25, search = "", city = "", membershipType = "", dateFilter = "all", } = req.query;
        // console.log("page", page, limit)
        const result = await getAllSuppliersService({
            page: Number(page),
            limit: Number(limit),
            search,
            city,
            membershipType,
            dateFilter,
        });

        return res.status(200).json({ success: true, ...result, });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, });
    }
};

export const getSupplierById = async (req, res) => {
    try {
        const supplier = await getSupplierByIdService(req.params.id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: supplier,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid supplier ID",
            });
        }

        const supplier = await updateSupplierByIdService(id, req.body);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier,
        });
    } catch (error) {
        console.error("Update supplier error:", error);

        const status =
            error.statusCode ||
            (error.code === 11000 ? 409 : 500);

        return res.status(status).json({
            success: false,
            message:
                error.code === 11000
                    ? "Email already exists"
                    : status === 500
                        ? "Failed to update supplier"
                        : error.message,
        });
    }
};

export const addServiceLocation = async (req, res) => {
    try {
        const { city } = req.body;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City is required",
            });
        }

        const business = await addServiceLocationService(req.params.id, city);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Location added successfully",
            data: business,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const removeServiceLocation = async (req, res) => {
    try {
        const { city } = req.body;

        const business = await removeServiceLocationService(req.params.id, city);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Location removed successfully",
            data: business,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};