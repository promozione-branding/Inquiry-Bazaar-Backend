
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import SideBar from "../../components/SideBar";
import Header from "../../components/Header";

import {
  Users,
  Store,
  MessageSquareMore,
  FolderPlus,
  Package,
  Factory,
  Headphones,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  CalendarDays,
  ArrowUpRight,
  Mail,
  Clock3,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const LEAD_BACKEND_URL = import.meta.env.VITE_LEAD_BACKEND_URL;
const LEAD_FORM_ID = "7303486777";

const COLORS = [
  "#2563EB",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#06B6D4",
];

const FILTERS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
];

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeLeads = (response) => {
  const root = response?.data ?? response;

  const candidates = [
    root,
    root?.forms,
    root?.leads,
    root?.results,
    root?.data,
    root?.data?.forms,
    root?.data?.leads,
    root?.data?.results,
    root?.data?.data,
  ];

  const records = candidates.find(Array.isArray);

  if (!records) {
    throw new Error("Unexpected leads API response format");
  }

  const totalCandidates = [
    root?.total,
    root?.totalCount,
    root?.totalForms,
    root?.count,
    root?.pagination?.total,
    root?.data?.total,
    root?.data?.totalCount,
    root?.data?.totalForms,
    root?.data?.pagination?.total,
  ];

  const reportedTotal = totalCandidates.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      Number.isFinite(Number(value))
  );

  const leads = records.map((lead, index) => ({
    id: lead._id || lead.id || index,
    name:
      lead.name ||
      lead.fullName ||
      lead.full_name ||
      lead.customerName ||
      "-",
    email: lead.email || lead.emailAddress || "-",
    phone:
      lead.phone ||
      lead.mobile ||
      lead.phoneNumber ||
      "-",
    category:
      lead.category ||
      lead.product ||
      lead.subject ||
      lead.service ||
      "-",
    status: lead.status || lead.stage || "New",
    createdAt:
      lead.createdAt ||
      lead.created_at ||
      lead.date ||
      null,
  }));

  return {
    leads,
    total:
      reportedTotal !== undefined
        ? Number(reportedTotal)
        : leads.length,
    hasReportedTotal: reportedTotal !== undefined,
  };
};

const StatCard = ({
  title,
  value,
  total,
  icon: Icon,
  color,
  bg,
}) => (
  <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
          {formatNumber(value)}
        </h2>
      </div>

      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={23} />
      </div>
    </div>

    {total !== undefined && (
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <TrendingUp size={13} />
          Selected period
        </span>
        <span className="text-xs font-semibold text-gray-700">
          {formatNumber(total)} all time
        </span>
      </div>
    )}
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
    {children}
  </div>
);

const EmptyChart = ({ text = "No data for this period" }) => (
  <div className="flex h-72 flex-col items-center justify-center gap-3 text-gray-400">
    <TrendingUp size={30} />
    <p className="text-sm">{text}</p>
  </div>
);

const DataTable = ({ title, headers, rows, renderRow }) => (
  <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="border-b border-gray-100 p-5">
      <h3 className="text-lg font-bold text-gray-900">
        {title}
      </h3>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[550px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-5 py-4 font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {rows.length ? (
            rows.map(renderRow)
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="px-5 py-10 text-center text-gray-400"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const TD = ({ children, className = "" }) => (
  <td className={`px-5 py-4 text-gray-600 ${className}`}>
    {children ?? "-"}
  </td>
);

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  const [openSideBar, setOpenSideBar] = useState(false);
  const [filter, setFilter] = useState("7days");

  const [dashboard, setDashboard] = useState(null);
  const [leadsData, setLeadsData] = useState({
    leads: [],
    total: 0,
    hasReportedTotal: false,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [leadsError, setLeadsError] = useState("");

  const fetchDashboard = useCallback(
    async (signal) => {
      const res = await axios.get(`${BACKEND_URL}/api/admin/dashboard/stats`,
        {
          params: { filter },
          withCredentials: true,
          signal,
        }
      );

      return res.data.data;
    },
    [filter]
  );

  const fetchLeads = useCallback(
    async (signal) => {
      const res = await axios.get(
        `${LEAD_BACKEND_URL}/api/form/get-forms/${LEAD_FORM_ID}`,
        {
          params: { filter },
          signal,
        }
      );

      return normalizeLeads(res.data);
    },
    [filter]
  );

  const loadData = useCallback(
    async (signal, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setDashboardError("");
      setLeadsError("");

      const [dashboardResult, leadsResult] =
        await Promise.allSettled([
          fetchDashboard(signal),
          fetchLeads(signal),
        ]);

      if (signal?.aborted) return;

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
      } else {
        setDashboard(null);
        setDashboardError(
          dashboardResult.reason?.response?.data?.message ||
          "Unable to load dashboard analytics"
        );
      }

      if (leadsResult.status === "fulfilled") {
        setLeadsData(leadsResult.value);
      } else {
        setLeadsData({
          leads: [],
          total: 0,
          hasReportedTotal: false,
        });
        setLeadsError(
          leadsResult.reason?.response?.data?.message ||
          leadsResult.reason?.message ||
          "Unable to load leads"
        );
      }

      setLoading(false);
      setRefreshing(false);
    },
    [fetchDashboard, fetchLeads]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  const refresh = () => {
    if (refreshing || loading) return;
    loadData(undefined, true);
  };

  const stats = useMemo(() => {
    const filtered = dashboard?.filtered || {};
    const totals = dashboard?.totals || {};

    return [
      {
        title: "Total Sellers",
        value: filtered.sellers,
        total: totals.sellers,
        icon: Store,
        color: "#2563EB",
        bg: "#EFF6FF",
      },
      {
        title: "Total Buyers",
        value: filtered.buyers,
        total: totals.buyers,
        icon: Users,
        color: "#8B5CF6",
        bg: "#F5F3FF",
      },
      {
        title: "Categories",
        value: filtered.categories,
        total: totals.categories,
        icon: FolderPlus,
        color: "#10B981",
        bg: "#ECFDF5",
      },
      {
        title: "Industries",
        value: filtered.industries,
        total: totals.industries,
        icon: Factory,
        color: "#F59E0B",
        bg: "#FFFBEB",
      },
      {
        title: "Products",
        value: filtered.products,
        total: totals.products,
        icon: Package,
        color: "#06B6D4",
        bg: "#ECFEFF",
      },
      {
        title: "Leads / Inquiries",
        value: leadsData.total,
        icon: MessageSquareMore,
        color: "#EC4899",
        bg: "#FDF2F8",
      },
      {
        title: "Support Tickets",
        value: filtered.tickets,
        total: totals.tickets,
        icon: Headphones,
        color: "#EF4444",
        bg: "#FEF2F2",
      },
      {
        title: "Open Tickets",
        value:
          dashboard?.ticketStatus?.find(
            (item) => item.name === "Open"
          )?.value || 0,
        icon: Clock3,
        color: "#EA580C",
        bg: "#FFF7ED",
      },
    ];
  }, [dashboard, leadsData]);

  const growth = dashboard?.growth || [];
  const topCategories = dashboard?.topCategories || [];
  const topIndustries = dashboard?.topIndustries || [];
  const userDistribution = dashboard?.userDistribution || [];
  const ticketStatus = dashboard?.ticketStatus || [];

  const hasPieData = (data) =>
    data.some((item) => Number(item.value) > 0);

  return (
    <div className="flex min-h-screen bg-[#F5F7FB]">
      <SideBar
        open={openSideBar}
        setOpen={setOpenSideBar}
      />

      <div className="min-w-0 flex-1">
        <Header
          user={user}
          name="Dashboard"
          openSideBar={openSideBar}
          setOpenSideBar={setOpenSideBar}
        />

        <main className="mx-auto max-w-[1700px] space-y-7 p-4 md:p-7">
          {/* PAGE HEADER */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Dashboard Overview
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor suppliers, buyers, products, leads and platform activity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
                <CalendarDays size={17} className="text-gray-500" />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="min-h-11 bg-transparent py-2 text-sm font-medium text-gray-700 outline-none"
                >
                  {FILTERS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={refresh}
                disabled={loading || refreshing}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {dashboardError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} />
              {dashboardError}
            </div>
          )}

          {leadsError && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle size={18} />
              Leads could not be loaded: {leadsError}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[450px] items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={40}
                  className="mx-auto animate-spin text-blue-600"
                />
                <p className="mt-4 text-sm text-gray-500">
                  Loading dashboard analytics...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* STATS */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <StatCard
                    key={item.title}
                    {...item}
                  />
                ))}
              </div>

              {/* GROWTH CHART */}
              <ChartCard
                title="Platform Growth"
                subtitle="New sellers, buyers, products and categories by date"
              >
                {growth.length ? (
                  <div className="h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growth}>
                        <defs>
                          {[
                            ["sellers", "#2563EB"],
                            ["buyers", "#8B5CF6"],
                            ["products", "#10B981"],
                            ["categories", "#F59E0B"],
                          ].map(([key, color]) => (
                            <linearGradient
                              key={key}
                              id={`gradient-${key}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={color}
                                stopOpacity={0.18}
                              />
                              <stop
                                offset="95%"
                                stopColor={color}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          ))}
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#E5E7EB"
                        />

                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(date) => date.slice(5)}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11 }}
                        />

                        <Tooltip />
                        <Legend />

                        {[
                          ["sellers", "#2563EB"],
                          ["buyers", "#8B5CF6"],
                          ["products", "#10B981"],
                          ["categories", "#F59E0B"],
                        ].map(([key, color]) => (
                          <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={color}
                            fill={`url(#gradient-${key})`}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart />
                )}
              </ChartCard>

              {/* BAR CHARTS */}
              <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard
                  title="Top Product Categories"
                  subtitle="Categories with the most products in the selected period"
                >
                  {topCategories.length ? (
                    <div className="h-[310px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topCategories}
                          margin={{ left: 0, right: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            tickFormatter={(v) =>
                              String(v).length > 12
                                ? `${String(v).slice(0, 12)}...`
                                : v
                            }
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            name="Products"
                            fill="#2563EB"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={50}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart />
                  )}
                </ChartCard>

                <ChartCard
                  title="Top Industries"
                  subtitle="Industries ranked by newly created categories"
                >
                  {topIndustries.length ? (
                    <div className="h-[310px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topIndustries}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            tickFormatter={(v) =>
                              String(v).length > 12
                                ? `${String(v).slice(0, 12)}...`
                                : v
                            }
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            name="Categories"
                            fill="#8B5CF6"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={50}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart />
                  )}
                </ChartCard>
              </div>

              {/* PIE CHARTS */}
              <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard
                  title="User Distribution"
                  subtitle="New buyers versus new suppliers"
                >
                  {hasPieData(userDistribution) ? (
                    <div className="h-[290px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userDistribution}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                          >
                            {userDistribution.map((item, index) => (
                              <Cell
                                key={item.name}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart />
                  )}
                </ChartCard>

                <ChartCard
                  title="Support Ticket Status"
                  subtitle="Tickets created during the selected period"
                >
                  {hasPieData(ticketStatus) ? (
                    <div className="h-[290px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ticketStatus}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                          >
                            {ticketStatus.map((item, index) => (
                              <Cell
                                key={item.name}
                                fill={
                                  ["#F59E0B", "#3B82F6", "#10B981"][index]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart />
                  )}
                </ChartCard>
              </div>

              {/* LEADS TABLE */}
              <DataTable
                title={`Recent Leads / Inquiries (${formatNumber(
                  leadsData.total
                )})`}
                headers={[
                  "Name",
                  "Email",
                  "Phone",
                  "Category / Product",
                  "Status",
                  "Date",
                ]}
                rows={leadsData.leads.slice(0, 10)}
                renderRow={(lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <TD className="font-semibold text-gray-900">
                      {lead.name}
                    </TD>
                    <TD>{lead.email}</TD>
                    <TD>{lead.phone}</TD>
                    <TD>{lead.category}</TD>
                    <TD>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {lead.status}
                      </span>
                    </TD>
                    <TD>{formatDate(lead.createdAt)}</TD>
                  </tr>
                )}
              />

              {/* RECENT SUPPLIERS AND PRODUCTS */}
              <div className="grid gap-6 xl:grid-cols-2">
                <DataTable
                  title="Recent Suppliers"
                  headers={["Supplier", "Email", "Joined"]}
                  rows={dashboard?.recent?.sellers || []}
                  renderRow={(seller) => (
                    <tr key={seller._id} className="hover:bg-gray-50">
                      <TD className="font-semibold text-gray-900">
                        {seller.name}
                      </TD>
                      <TD>{seller.email}</TD>
                      <TD>{formatDate(seller.createdAt)}</TD>
                    </tr>
                  )}
                />

                <DataTable
                  title="Recent Products"
                  headers={["Product", "Supplier", "Price", "Date"]}
                  rows={dashboard?.recent?.products || []}
                  renderRow={(product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <TD className="font-semibold text-gray-900">
                        {product.name}
                      </TD>
                      <TD>{product.supplierId?.name || "-"}</TD>
                      <TD>
                        {product.price != null
                          ? `₹${formatNumber(product.price)}`
                          : "On Request"}
                      </TD>
                      <TD>{formatDate(product.createdAt)}</TD>
                    </tr>
                  )}
                />
              </div>

              {/* RECENT SUPPORT */}
              <DataTable
                title="Recent Support Requests"
                headers={[
                  "Subject",
                  "User",
                  "Issue Type",
                  "Status",
                  "Date",
                ]}
                rows={dashboard?.recent?.tickets || []}
                renderRow={(ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <TD className="font-semibold text-gray-900">
                      {ticket.subject}
                    </TD>
                    <TD>{ticket.userId?.name || "-"}</TD>
                    <TD>{ticket.issueType}</TD>
                    <TD>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${ticket.status === "RESOLVED"
                          ? "bg-green-50 text-green-700"
                          : ticket.status === "IN PROGRESS"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                          }`}
                      >
                        {ticket.status}
                      </span>
                    </TD>
                    <TD>{formatDate(ticket.createdAt)}</TD>
                  </tr>
                )}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
