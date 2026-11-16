import { getLeadsByDateService, getSupplierInquiryService } from "../services/lead.service.js";

export const getLeadsByDateController = async (req, res) => {
    try {
        const { userId } = req.params;

        const { startDate, endDate } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required",
            });
        }

        const result = await getLeadsByDateService({
            userId,
            startDate,
            endDate,
        });

        return res.status(200).json({
            success: true,
            message: "Leads fetched successfully",
            data: result,
        });

    } catch (error) {
        console.error("Get leads by date error:", error);

        const isValidationError =
            error.message === "Invalid user ID" ||
            error.message === "Invalid date" ||
            error.message === "Start date cannot be after end date" ||
            error.message === "Date format must be YYYY-MM-DD" ||
            error.message === "Start date and end date are required";

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: isValidationError
                ? error.message
                : "Failed to fetch leads",
        });
    }
};

export const getSupplierInquiryController = async (req, res) => {
    try {
        const { userId } = req.params;

        const {
            filter = "today",
            startDate,
            endDate,
        } = req.query;

        const result = await getSupplierInquiryService({
            userId,
            filter,
            startDate,
            endDate,
        });

        return res.status(200).json({
            success: true,
            message: "Supplier inquiries fetched successfully",
            count: result.totalLeads,
            totalLeads: result.totalLeads,
            filter: result.filter,
            startDate: result.startDate,
            endDate: result.endDate,
            data: result.data,
        });

    } catch (error) {
        console.error("Get supplier inquiries error:", error);

        const validationErrors = [
            "Invalid supplier ID",
            "Date format must be YYYY-MM-DD",
            "Invalid calendar date",
            "Both startDate and endDate are required",
            "Start date cannot be after end date",
            "Invalid filter",
        ];

        const isValidationError =
            validationErrors.includes(error.message);

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: isValidationError
                ? error.message
                : "Failed to fetch supplier inquiries",
        });
    }
};