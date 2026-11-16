
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";

import SideBar from "../../../components/SideBar";
import Header from "../../../components/Header";

import {
    Search,
    Eye,
    Phone,
    MessageCircle,
    MousePointerClick,
    FileText,
    CalendarDays,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Building2,
    MapPin,
    ExternalLink,
    Activity,
} from "lucide-react";

const LEAD_API = import.meta.env.VITE_LEAD_BACKEND_URL;
const BACKEND_API = import.meta.env.VITE_BACKEND_URL;

const FILTERS = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "all", label: "All Time" },
];

const EVENT_LABELS = {
    whatsapp_click: "WhatsApp Click",
    call_click: "Call Click",
    inquiry_open: "Inquiry Open",
    inquiry_submit: "Inquiry Submit",
    product_view: "Product View",
};

const EVENT_STYLES = {
    whatsapp_click: "bg-green-50 text-green-700",
    call_click: "bg-blue-50 text-blue-700",
    inquiry_open: "bg-purple-50 text-purple-700",
    inquiry_submit: "bg-orange-50 text-orange-700",
    product_view: "bg-sky-50 text-sky-700",
};

const EMPTY_COUNTS = {
    whatsapp_click: 0,
    call_click: 0,
    inquiry_open: 0,
    inquiry_submit: 0,
    product_view: 0,
};

// Dates are calculated in Indian Standard Time.
const IST_OFFSET = 330 * 60 * 1000;

const getISTDate = (date = new Date()) =>
    new Date(date.getTime() + IST_OFFSET)
        .toISOString()
        .slice(0, 10);

const shiftDate = (dateString, days) => {
    const date = new Date(`${dateString}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

const getDateRange = (filter) => {
    const today = getISTDate();

    switch (filter) {
        case "today":
            return { startDate: today, endDate: today };

        case "yesterday": {
            const yesterday = shiftDate(today, -1);
            return {
                startDate: yesterday,
                endDate: yesterday,
            };
        }

        case "7days":
            return {
                startDate: shiftDate(today, -6),
                endDate: today,
            };

        case "30days":
            return {
                startDate: shiftDate(today, -29),
                endDate: today,
            };

        default:
            return null;
    }
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getText = (value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

function StatCard({
    title,
    value,
    icon: Icon,
    color,
    bg,
    loading,
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-gray-500 font-medium">
                        {title}
                    </p>

                    {loading ? (
                        <div className="mt-4 h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                        <h3 className="text-3xl font-bold text-gray-900 mt-3">
                            {Number(value || 0).toLocaleString("en-IN")}
                        </h3>
                    )}
                </div>

                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon size={22} />
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <p className="text-xs font-medium text-gray-400 mb-1">
                {label}
            </p>
            <p className="text-sm text-gray-800 break-words">
                {getText(value)}
            </p>
        </div>
    );
}

export default function SellerLeads() {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [openSideBar, setOpenSideBar] = useState(false);

    const [supplierData, setSupplierData] = useState({});
    const [leads, setLeads] = useState([]);
    const [trackingData, setTrackingData] = useState([]);

    const [eventCounts, setEventCounts] = useState(EMPTY_COUNTS);
    const [totalTracking, setTotalTracking] = useState(0);

    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [filter, setFilter] = useState("today");
    const [activeTab, setActiveTab] = useState("leads");

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);

    const [errors, setErrors] = useState({
        leads: "",
        tracking: "",
    });

    const itemsPerPage = 10;

    // Fetch supplier details
    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();

        const fetchDetails = async () => {
            try {
                const res = await axios.get(
                    `${BACKEND_API}/api/supplier/${id}`,
                    {
                        withCredentials: true,
                        signal: controller.signal,
                    }
                );

                setSupplierData(res.data.data || {});
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.error("Supplier details error:", error);
                }
            }
        };

        fetchDetails();

        return () => controller.abort();
    }, [id]);

    // Fetch inquiry leads and tracking events
    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setErrors({ leads: "", tracking: "" });

            const dateRange = getDateRange(filter);

            const inquiryRequest = axios.get(
                `${BACKEND_API}/api/leads/supplier/${id}`,
                {
                    params: {
                        filter,
                    },
                    signal: controller.signal,
                    withCredentials: false,
                }
            );

            const trackingRequest = axios.get(
                `${LEAD_API}/api/tracking/events/supplier/${id}`,
                {
                    params: dateRange
                        ? dateRange
                        : { filter: "all" },
                    signal: controller.signal,
                    withCredentials: false,
                }
            );

            try {
                const results = await Promise.allSettled([
                    inquiryRequest,
                    trackingRequest,
                ]);

                if (controller.signal.aborted) return;

                // Inquiry response
                const inquiryResult = results[0];

                if (
                    inquiryResult.status === "fulfilled" &&
                    inquiryResult.value.data?.success
                ) {
                    const data = inquiryResult.value.data.data;

                    setLeads(Array.isArray(data) ? data : []);
                } else {
                    setLeads([]);

                    setErrors((prev) => ({
                        ...prev,
                        leads: "Unable to fetch inquiry leads.",
                    }));
                }

                // Tracking response
                const trackingResult = results[1];

                if (
                    trackingResult.status === "fulfilled" &&
                    trackingResult.value.data?.success
                ) {
                    const result = trackingResult.value.data;

                    const events = Array.isArray(result.data)
                        ? result.data
                        : [];

                    setTrackingData(events);

                    // Prefer counts returned by BrandBnalo.
                    const counts = { ...EMPTY_COUNTS };

                    if (result.eventCounts) {
                        for (const key of Object.keys(counts)) {
                            counts[key] = Number(
                                result.eventCounts[key] ?? 0
                            );
                        }
                    } else {
                        for (const event of events) {
                            if (
                                Object.prototype.hasOwnProperty.call(
                                    counts,
                                    event.eventType
                                )
                            ) {
                                counts[event.eventType]++;
                            }
                        }
                    }

                    setEventCounts(counts);
                    setTotalTracking(
                        Number(result.count ?? events.length)
                    );
                } else {
                    setTrackingData([]);
                    setEventCounts({ ...EMPTY_COUNTS });
                    setTotalTracking(0);

                    setErrors((prev) => ({
                        ...prev,
                        tracking: "Unable to fetch tracking events.",
                    }));
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.error("Dashboard error:", error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => controller.abort();
    }, [id, filter, refreshKey]);

    // Search records based on selected tab
    const filteredData = useMemo(() => {
        const data = activeTab === "leads" ? leads : trackingData;

        const keyword = search.trim().toLowerCase();

        if (!keyword) return data;

        return data.filter((item) => {
            const values =
                activeTab === "leads"
                    ? [
                        item.name,
                        item.phone,
                        item.email,
                        item.product,
                        item.companyName,
                        item.place,
                        item.message,
                    ]
                    : [
                        item.eventType,
                        EVENT_LABELS[item.eventType],
                        item.productId,
                        item.source,
                        item.supplierToken,
                    ];

            return values.some((value) =>
                getText(value).toLowerCase().includes(keyword)
            );
        });
    }, [activeTab, leads, trackingData, search]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

    const safePage = Math.min(currentPage, totalPages);

    const paginatedData = filteredData.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage
    );

    const handleFilterChange = (value) => {
        setFilter(value);
        setCurrentPage(1);
        setSearch("");
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSearch("");
    };

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar
                open={openSideBar}
                setOpen={setOpenSideBar}
            />

            <div className="flex-1 min-w-0">
                <Header
                    user={user}
                    name={supplierData.name || "Seller Leads"}
                    openSideBar={openSideBar}
                    setOpenSideBar={setOpenSideBar}
                />

                <main className="p-4 md:p-6 space-y-6">
                    {/* Page heading */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Leads & Tracking Analytics
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                Manage inquiries and monitor customer
                                interactions for{" "}
                                <span className="font-semibold text-gray-700">
                                    {supplierData.name || "Seller"}
                                </span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <CalendarDays
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />

                                <select
                                    value={filter}
                                    onChange={(e) =>
                                        handleFilterChange(e.target.value)
                                    }
                                    className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-blue-500"
                                >
                                    {FILTERS.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                                title="Refresh data"
                            >
                                <RefreshCcw
                                    size={18}
                                    className={
                                        loading
                                            ? "animate-spin text-blue-600"
                                            : "text-gray-600"
                                    }
                                />
                            </button>
                        </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Inquiries"
                            value={leads.length}
                            icon={FileText}
                            color="text-blue-600"
                            bg="bg-blue-50"
                            loading={loading}
                        />

                        <StatCard
                            title="WhatsApp Clicks"
                            value={eventCounts.whatsapp_click}
                            icon={MessageCircle}
                            color="text-green-600"
                            bg="bg-green-50"
                            loading={loading}
                        />

                        <StatCard
                            title="Call Clicks"
                            value={eventCounts.call_click}
                            icon={Phone}
                            color="text-orange-600"
                            bg="bg-orange-50"
                            loading={loading}
                        />

                        <StatCard
                            title="Total Track Clicks"
                            value={totalTracking}
                            icon={MousePointerClick}
                            color="text-purple-600"
                            bg="bg-purple-50"
                            loading={loading}
                        />
                    </div>

                    {/* Additional event breakdown */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <Activity
                                size={19}
                                className="text-[#074977]"
                            />

                            <h2 className="font-bold text-gray-800">
                                Tracking Event Breakdown
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(eventCounts).map(
                                ([type, count]) => (
                                    <div
                                        key={type}
                                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                    >
                                        <p className="text-xs text-gray-500 font-medium">
                                            {EVENT_LABELS[type] || type}
                                        </p>

                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {loading
                                                ? "..."
                                                : count.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Main table */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* Tabs and search */}
                        <div className="p-4 md:p-5 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleTabChange("leads")
                                        }
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "leads"
                                            ? "bg-white text-[#074977] shadow-sm"
                                            : "text-gray-500 hover:text-gray-800"
                                            }`}
                                    >
                                        <FileText size={16} />
                                        Inquiry Leads
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                            {leads.length}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleTabChange("tracking")
                                        }
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "tracking"
                                            ? "bg-white text-[#074977] shadow-sm"
                                            : "text-gray-500 hover:text-gray-800"
                                            }`}
                                    >
                                        <MousePointerClick size={16} />
                                        Track Clicks
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                            {totalTracking}
                                        </span>
                                    </button>
                                </div>

                                <div className="relative w-full lg:w-72">
                                    <Search
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder={
                                            activeTab === "leads"
                                                ? "Search inquiries..."
                                                : "Search tracking events..."
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* API error */}
                        {errors[activeTab] && (
                            <div className="mx-5 mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                                {errors[activeTab]}
                            </div>
                        )}

                        {/* Data table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-sm">
                                <thead className="bg-gray-50">
                                    {activeTab === "leads" ? (
                                        <tr>
                                            {[
                                                "Name",
                                                "Product",
                                                "Phone",
                                                "Email",
                                                "Source",
                                                "Date & Time",
                                                "Action",
                                            ].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    ) : (
                                        <tr>
                                            {[
                                                "Event Type",
                                                "Product",
                                                "Source",
                                                "IP",
                                                "Date & Time",
                                                "Action",
                                            ].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    )}
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={activeTab === "leads" ? 7 : 6}
                                                className="py-16 text-center"
                                            >
                                                <RefreshCcw
                                                    size={25}
                                                    className="animate-spin text-blue-600 mx-auto mb-3"
                                                />
                                                <p className="text-gray-500">
                                                    Loading records...
                                                </p>
                                            </td>
                                        </tr>
                                    ) : paginatedData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={activeTab === "leads" ? 7 : 6}
                                                className="py-16 text-center"
                                            >
                                                <Search
                                                    size={30}
                                                    className="text-gray-300 mx-auto mb-3"
                                                />
                                                <p className="font-medium text-gray-700">
                                                    No records found
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Try changing your search or date filter.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <tr
                                                key={item._id || index}
                                                className="border-t border-gray-100 hover:bg-blue-50/30 transition"
                                            >
                                                {activeTab === "leads" ? (
                                                    <>
                                                        <td className="px-5 py-4">
                                                            <p className="font-semibold text-gray-800">
                                                                {item.name || "-"}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {item.companyName || ""}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-700">
                                                            {getText(item.product)}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {item.phone ? (
                                                                <a
                                                                    href={`tel:${item.phone}`}
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    {item.phone}
                                                                </a>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {getText(item.email)}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {/* Lead Source */}
                                                                <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold capitalize">
                                                                    {item.source || "Website"}
                                                                </span>

                                                                {/* Lead Stage */}
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${item.stage === "new"
                                                                        ? "bg-green-50 text-green-700"
                                                                        : item.stage === "contacted"
                                                                            ? "bg-blue-50 text-blue-700"
                                                                            : item.stage === "qualified"
                                                                                ? "bg-purple-50 text-purple-700"
                                                                                : item.stage === "converted"
                                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                                    : item.stage === "lost"
                                                                                        ? "bg-red-50 text-red-700"
                                                                                        : "bg-gray-100 text-gray-600"
                                                                        }`}
                                                                >
                                                                    {item.stage?.replace(/[_-]/g, " ") || "New"}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-semibold text-gray-800">
                                                                    {item.createdAt
                                                                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                                            timeZone: "Asia/Kolkata",
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })
                                                                        : "-"}
                                                                </span>

                                                                <span className="text-xs text-gray-500">
                                                                    {item.createdAt
                                                                        ? new Date(item.createdAt).toLocaleTimeString("en-IN", {
                                                                            timeZone: "Asia/Kolkata",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            hour12: true,
                                                                        })
                                                                        : "-"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex px-3 py-1.5 text-nowrap rounded-lg text-xs font-semibold ${EVENT_STYLES[item.eventType] ||
                                                                    "bg-gray-100 text-gray-600"
                                                                    }`}
                                                            >
                                                                {EVENT_LABELS[item.eventType] ||
                                                                    item.eventType ||
                                                                    "-"}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 font-medium text-gray-800">
                                                            {getText(item.productId)}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600">
                                                            {getText(item.source)}
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-500">
                                                            <span className="font-mono text-xs">
                                                                {getText(item.ipAddress)}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-semibold text-gray-800">
                                                                    {item.createdAt
                                                                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                                            timeZone: "Asia/Kolkata",
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })
                                                                        : "-"}
                                                                </span>

                                                                <span className="text-xs text-gray-500">
                                                                    {item.createdAt
                                                                        ? new Date(item.createdAt).toLocaleTimeString("en-IN", {
                                                                            timeZone: "Asia/Kolkata",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            hour12: true,
                                                                        })
                                                                        : "-"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}

                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedItem({
                                                                ...item,
                                                                recordType: activeTab,
                                                            })
                                                        }
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                                        title="View details"
                                                    >
                                                        <Eye size={17} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-sm text-gray-500">
                                Showing{" "}
                                <span className="font-semibold text-gray-800">
                                    {filteredData.length
                                        ? (safePage - 1) * itemsPerPage + 1
                                        : 0}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-gray-800">
                                    {Math.min(
                                        safePage * itemsPerPage,
                                        filteredData.length
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-800">
                                    {filteredData.length}
                                </span>{" "}
                                records
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={safePage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <span className="text-sm font-medium text-gray-700 px-3">
                                    Page {safePage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1)
                                        )
                                    }
                                    disabled={safePage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Details modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {selectedItem.recordType === "leads"
                                        ? "Inquiry Details"
                                        : "Tracking Event Details"}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Complete record information
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5">
                            {selectedItem.recordType === "leads" ? (
                                <>
                                    <DetailRow
                                        label="Name"
                                        value={selectedItem.name}
                                    />
                                    <DetailRow
                                        label="Company"
                                        value={selectedItem.companyName}
                                    />
                                    <DetailRow
                                        label="Phone"
                                        value={selectedItem.phone}
                                    />
                                    <DetailRow
                                        label="Email"
                                        value={selectedItem.email}
                                    />
                                    <DetailRow
                                        label="Product"
                                        value={selectedItem.product}
                                    />
                                    <DetailRow
                                        label="Place"
                                        value={selectedItem.place}
                                    />
                                    <DetailRow
                                        label="Message"
                                        value={selectedItem.message}
                                    />
                                    <DetailRow
                                        label="Source"
                                        value={selectedItem.source}
                                    />
                                    <DetailRow
                                        label="Date"
                                        value={formatDate(selectedItem.createdAt)}
                                    />
                                </>
                            ) : (
                                <>
                                    <DetailRow
                                        label="Event Type"
                                        value={
                                            EVENT_LABELS[selectedItem.eventType] ||
                                            selectedItem.eventType
                                        }
                                    />
                                    <DetailRow
                                        label="Product"
                                        value={selectedItem.productId}
                                    />
                                    <DetailRow
                                        label="Source"
                                        value={selectedItem.source}
                                    />
                                    <DetailRow
                                        label="Supplier Token"
                                        value={selectedItem.supplierToken}
                                    />
                                    <DetailRow
                                        label="Event ID"
                                        value={selectedItem._id}
                                    />
                                    <DetailRow
                                        label="Date"
                                        value={formatDate(selectedItem.createdAt)}
                                    />
                                </>
                            )}

                            {/* {selectedItem.recordType === "leads" && (
                                <div className="flex gap-3 mt-5">
                                    {selectedItem.phone && (
                                        <a
                                            href={`tel:${selectedItem.phone}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm"
                                        >
                                            <Phone size={16} />
                                            Call
                                        </a>
                                    )}

                                    {selectedItem.email && (
                                        <a
                                            href={`mailto:${selectedItem.email}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm"
                                        >
                                            <Mail size={16} />
                                            Email
                                        </a>
                                    )}
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
