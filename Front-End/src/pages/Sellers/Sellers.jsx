import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../../components/SideBar';
import Header from '../../components/Header';
import axios from 'axios';
import { Edit, Eye, Filter, Headset, Images, Package, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { locations } from '../../data/data';

export default function Sellers() {
    const { user } = useSelector((state) => state.auth);
    const [openSideBar, setOpenSideBar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openFilter, setOpenFilter] = useState(false);
    const [membershipType, setMembershipType] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [tempMembershipType, setTempMembershipType] = useState("");
    const [tempSelectedCity, setTempSelectedCity] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [searchInput, setSearchInput] = useState("");
    const [dateFilter, setDateFilter] = useState("all");

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchSuppliers();
    }, [currentPage, limit, membershipType, selectedCity, searchTerm, dateFilter,]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/all`,
                {
                    params: {
                        page: currentPage,
                        limit,
                        search: searchTerm,
                        city: selectedCity,
                        membershipType,
                        dateFilter,
                    },
                    withCredentials: true,
                }
            );
            console.log(data)
            setSuppliers(data.data);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } finally {
            setLoading(false);
        }
    };

    const getVisiblePages = () => {
        const delta = 1; // pages before & after current
        const range = [];

        const start = Math.max(2, currentPage - delta);
        const end = Math.min(totalPages - 1, currentPage + delta);

        range.push(1);

        if (start > 2) {
            range.push("...");
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        if (end < totalPages - 1) {
            range.push("...");
        }

        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    const visiblePages = getVisiblePages();

    // console.log(allSuppliers)

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar open={openSideBar} setOpen={setOpenSideBar} />

            <div className="flex-1">
                <Header user={user} name={"All Sellers"} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

                <main className="p-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Suppliers
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Total Suppliers: {loading ? "Loading..." : total}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search supplier..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Search
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                    </div>

                                    <button onClick={() => setOpenFilter(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Filter size={18} />
                                        Filter
                                    </button>

                                    <select
                                        value={dateFilter}
                                        onChange={(e) => {
                                            setDateFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200 rounded-lg"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-600">
                                            Supplier
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-600">
                                            Company
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-600">
                                            Phone
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-600">
                                            Email
                                        </th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-600">
                                            Status
                                        </th>
                                        <th className="text-center py-4 px-4 font-semibold text-gray-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        [...Array(8)].map((_, index) => (
                                            <tr key={index} className="border-t border-gray-200">
                                                {[...Array(6)].map((_, i) => (
                                                    <td key={i} className="px-4 py-5">
                                                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : suppliers.length > 0 ? (
                                        suppliers.map((i, index) => (
                                            <tr key={i._id} className={`border-t border-gray-100 hover:bg-blue-50/40 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {i.profileImage ? (
                                                            <img
                                                                src={i.profileImage}
                                                                alt={i.name}
                                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full text-lg bg-linear-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                                                                {(i.business?.companyName?.charAt(0) || i.name?.charAt(0) || "?").toUpperCase()}
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">
                                                                {i.name}
                                                            </h4>

                                                            <p className="text-sm text-gray-500">
                                                                {i.business?.businessType ||
                                                                    "Supplier"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {i.business?.companyName || "-"}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {i.business?.businessField}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {i.phone}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-gray-600">
                                                        {i.email}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full flex text-nowrap text-xs font-semibold capitalize ${i.membership?.membershipType === "elite"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : i.membership?.membershipType === "pro"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : i.membership?.membershipType === "growth"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-orange-100 text-orange-700"
                                                            }`}
                                                    >
                                                        {i.membership?.membershipType || "NO Plan"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <Link to={`/seller-image/${i?._id}`} className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white transition"
                                                            title="Supplier All Images"
                                                        >
                                                            <Images size={18} />
                                                        </Link>

                                                        <Link to={`/seller-leads/${i?._id}`} className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-500 hover:text-white transition"
                                                            title="Supplier Lead"
                                                        >
                                                            <Headset size={18} />
                                                        </Link>

                                                        <Link to={`/edit-seller/${i?._id}`} className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white transition"
                                                            title="Edit Supplier"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-10 text-gray-500">
                                                No suppliers found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-200 bg-white">
                            <div className='flex items-center gap-2'>
                                <p className="text-sm text-gray-500">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {total === 0 ? 0 : (currentPage - 1) * limit + 1}
                                    </span>

                                    {" "}to{" "}

                                    <span className="font-medium">
                                        {Math.min(currentPage * limit, total)}
                                    </span>

                                    {" "}of{" "}

                                    <span className="font-medium">
                                        {total}
                                    </span>

                                    {" "}suppliers
                                </p>
                                <div>
                                    <select value={limit}
                                        onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                                        className="px-2 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200 rounded-lg"
                                    >
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={75}>75</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Previous
                                </button>

                                {visiblePages.map((page, index) =>
                                    page === "..." ? (
                                        <span key={`dots-${index}`} className="px-2 text-gray-500">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg border transition ${currentPage === page
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "border-gray-300 hover:bg-gray-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Overlay */}
            {openFilter && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setOpenFilter(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${openFilter ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-300">
                    <h2 className="text-lg font-semibold">Filters</h2>

                    <button
                        onClick={() => setOpenFilter(false)}
                        className="text-gray-500 hover:text-black text-xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 space-y-6">

                    {/* Membership Type */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Membership Type
                        </label>

                        <select
                            value={tempMembershipType}
                            onChange={(e) => setTempMembershipType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select Membership</option>
                            <option value="Elite">Elite</option>
                            <option value="Pro">Pro</option>
                            <option value="Growth">Growth</option>
                            <option value="Starter">Starter</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Location
                        </label>

                        <select
                            value={tempSelectedCity}
                            onChange={(e) => setTempSelectedCity(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select City</option>

                            {locations.flatMap((state) =>
                                state.cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setTempMembershipType("");
                                setTempSelectedCity("");
                                setMembershipType("");
                                setSelectedCity("");
                                setCurrentPage(1);
                                setOpenFilter(false);
                            }}
                            className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-100"
                        >
                            Reset
                        </button>

                        <button
                            onClick={() => {
                                setMembershipType(tempMembershipType);
                                setSelectedCity(tempSelectedCity);
                                setCurrentPage(1);
                                setOpenFilter(false);
                            }}
                            className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
