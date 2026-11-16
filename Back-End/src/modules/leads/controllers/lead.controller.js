import { getLeadsByDateService } from "../services/lead.service.js";

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