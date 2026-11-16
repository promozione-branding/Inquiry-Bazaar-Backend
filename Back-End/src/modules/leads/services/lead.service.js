import mongoose from "mongoose";
import Lead from "../models/leads.model.js";
const TRACKING_API = "https://brandbnalo.com/api/tracking/events/supplier";
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

// Validate and convert YYYY-MM-DD to IST midnight
const parseISTDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (
        typeof dateString !== "string" ||
        !dateRegex.test(dateString)
    ) {
        throw new Error("Date format must be YYYY-MM-DD");
    }

    const date = new Date(`${dateString}T00:00:00+05:30`);

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

export const getLeadsByDateService = async ({ userId, startDate, endDate, }) => {
    // 1. Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
    }

    // 2. Convert dates to IST
    const start = parseISTDate(startDate);
    const nextDay = parseISTDate(endDate);

    // Include entire end date
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    if (start >= nextDay) {
        throw new Error("Start date cannot be after end date");
    }

    // 3. MongoDB leads filter
    const filter = {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: start, $lt: nextDay, },
    };

    // 4. BrandBnalo tracking API with custom dates
    const trackingUrl = new URL(`${TRACKING_API}/${encodeURIComponent(userId)}`);
    trackingUrl.searchParams.set("startDate", startDate);
    trackingUrl.searchParams.set("endDate", endDate);

    // 5. Fetch lead count and tracking counts in parallel
    const [totalLeads, trackingResponse] = await Promise.all([Lead.countDocuments(filter),

    fetch(trackingUrl.toString(), {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
    }),
    ]);

    // 6. Validate tracking response
    if (!trackingResponse.ok) {
        throw new Error(`Tracking API failed: ${trackingResponse.status}`);
    }

    const trackingData = await trackingResponse.json();
    if (trackingData.success !== true || !trackingData.eventCounts || typeof trackingData.eventCounts !== "object") {
        throw new Error("Invalid BrandBnalo tracking response");
    }

    // 7. Get only required event counts
    const whatsappClick = trackingData.eventCounts.whatsapp_click ?? 0;
    const callClick = trackingData.eventCounts.call_click ?? 0;

    // 8. Return dashboard statistics
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