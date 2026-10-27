import { getAdminDashboardService } from "../services/dashboard.service.js";

const allowedFilters = [
    "today",
    "yesterday",
    "7days",
    "30days",
    "all",
];

export const getAdminDashboard = async (req, res) => {
    try {
        const filter = allowedFilters.includes(req.query.filter)
            ? req.query.filter
            : "7days";

        const data = await getAdminDashboardService(filter);

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data,
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
        });
    }
};