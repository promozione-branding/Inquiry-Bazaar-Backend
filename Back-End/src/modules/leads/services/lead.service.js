
import mongoose from "mongoose";
import Lead from "../models/leads.model.js";

const TRACKING_API =
    "https://brandbnalo.com/api/tracking/events/supplier";

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

// ========================================
// DATE HELPERS
// ========================================

// Get current date in IST (YYYY-MM-DD)
const getTodayIST = () => {
    return new Date(Date.now() + IST_OFFSET)
        .toISOString()
        .slice(0, 10);
};

// Validate and convert YYYY-MM-DD to IST midnight
const parseISTDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (
        typeof dateString !== "string" ||
        !dateRegex.test(dateString)
    ) {
        throw new Error("Date format must be YYYY-MM-DD");
    }

    const date = new Date(
        `${dateString}T00:00:00+05:30`
    );

    if (
        Number.isNaN(date.getTime()) ||
        new Date(date.getTime() + IST_OFFSET)
            .toISOString()
            .slice(0, 10) !== dateString
    ) {
        throw new Error("Invalid calendar date");
    }

    return date;
};

// Add days to a date without mutating original
const addDays = (date, days) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

// Validate MongoDB user ID
const validateUserId = (userId) => {
    if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !/^[a-fA-F0-9]{24}$/.test(userId)
    ) {
        throw new Error("Invalid user ID");
    }

    return new mongoose.Types.ObjectId(userId);
};

// Generate MongoDB date range
const getDateRange = ({
    filter = "today",
    startDate,
    endDate,
}) => {
    let from = null;
    let to = null;

    // Custom date range has priority
    if (
        startDate !== undefined ||
        endDate !== undefined
    ) {
        if (!startDate || !endDate) {
            throw new Error(
                "Both startDate and endDate are required"
            );
        }

        from = parseISTDate(startDate);
        to = addDays(parseISTDate(endDate), 1);

        if (from >= to) {
            throw new Error(
                "Start date cannot be after end date"
            );
        }

        return {
            from,
            to,
            filter: "custom",
        };
    }

    const today = parseISTDate(getTodayIST());

    switch (filter) {
        case "today":
            from = today;
            to = addDays(today, 1);
            break;

        case "yesterday":
            from = addDays(today, -1);
            to = today;
            break;

        case "7days":
            from = addDays(today, -6);
            to = addDays(today, 1);
            break;

        case "30days":
            from = addDays(today, -29);
            to = addDays(today, 1);
            break;

        case "all":
            break;

        default:
            throw new Error("Invalid filter");
    }

    return {
        from,
        to,
        filter,
    };
};

// ========================================
// 1. DASHBOARD LEAD + TRACKING COUNTS
// ========================================

export const getLeadsByDateService = async ({
    userId,
    startDate,
    endDate,
}) => {
    // Validate user ID
    const supplierObjectId = validateUserId(userId);

    if (!startDate || !endDate) {
        throw new Error(
            "Start date and end date are required"
        );
    }

    // Get IST date range
    const { from, to } = getDateRange({
        startDate,
        endDate,
    });

    // MongoDB leads filter
    const leadQuery = {
        userId: supplierObjectId,
        createdAt: {
            $gte: from,
            $lt: to,
        },
    };

    // BrandBnalo tracking API
    const trackingUrl = new URL(
        `${TRACKING_API}/${encodeURIComponent(userId)}`
    );

    trackingUrl.searchParams.set(
        "startDate",
        startDate
    );

    trackingUrl.searchParams.set(
        "endDate",
        endDate
    );

    // Fetch lead count and tracking data in parallel
    const [totalLeads, trackingResponse] =
        await Promise.all([
            Lead.countDocuments(leadQuery),

            fetch(trackingUrl.toString(), {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                signal: AbortSignal.timeout(15000),
            }),
        ]);

    if (!trackingResponse.ok) {
        throw new Error(
            `Tracking API failed: ${trackingResponse.status}`
        );
    }

    const trackingData =
        await trackingResponse.json();

    if (
        trackingData.success !== true ||
        !trackingData.eventCounts ||
        typeof trackingData.eventCounts !== "object" ||
        Array.isArray(trackingData.eventCounts)
    ) {
        throw new Error(
            "Invalid BrandBnalo tracking response"
        );
    }

    // Only required tracking counts
    const whatsappClick = Number(
        trackingData.eventCounts.whatsapp_click ?? 0
    );

    const callClick = Number(
        trackingData.eventCounts.call_click ?? 0
    );

    return {
        startDate,
        endDate,
        totalLeads,
        tracking: {
            whatsapp_click: whatsappClick,
            call_click: callClick,
        },
    };
};

// ========================================
// 2. GET SUPPLIER INQUIRY LEADS
// ========================================

export const getSupplierInquiryService = async ({
    userId,
    filter = "today",
    startDate,
    endDate,
}) => {
    // Validate supplier ID
    const supplierObjectId = validateUserId(userId);

    // Get date range
    const {
        from,
        to,
        filter: appliedFilter,
    } = getDateRange({
        filter,
        startDate,
        endDate,
    });

    // MongoDB query
    const query = {
        userId: supplierObjectId,
    };

    if (from || to) {
        query.createdAt = {};

        if (from) {
            query.createdAt.$gte = from;
        }

        if (to) {
            query.createdAt.$lt = to;
        }
    }

    // Fetch inquiries and count
    const [leads, totalLeads] =
        await Promise.all([
            Lead.find(query)
                .sort({ createdAt: -1 })
                .lean(),

            Lead.countDocuments(query),
        ]);

    return {
        totalLeads,
        count: totalLeads,
        filter: appliedFilter,
        startDate: startDate || null,
        endDate: endDate || null,
        data: leads,
    };
};
