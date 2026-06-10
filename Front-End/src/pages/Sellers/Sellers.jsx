import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../../components/SideBar';
import Header from '../../components/Header';
import axios from 'axios';
import { Edit, Eye, Filter, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sellers() {
    const { user } = useSelector((state) => state.auth);
    const [openSideBar, setOpenSideBar] = useState(false);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/all`, { withCredentials: true, });
                setAllSuppliers(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(allSuppliers.length / itemsPerPage);

    const paginatedSuppliers = allSuppliers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                                        Total Suppliers: {allSuppliers.length}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search supplier..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Search
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                    </div>

                                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Filter size={18} />
                                        Filter
                                    </button>

                                    <select className="px-4 py-2 border border-gray-300 rounded-lg">
                                        <option>All Suppliers</option>
                                        <option>Manufacturer</option>
                                        <option>Trader</option>
                                        <option>Exporter</option>
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
                                    {paginatedSuppliers.map((i, index) => (
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
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white transition"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    <Link to={`/edit-seller/${i?._id}`} className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white transition"
                                                        title="Edit Supplier"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-200 bg-white">

                            <p className="text-sm text-gray-500">
                                Showing{" "}
                                <span className="font-medium">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                </span>
                                {" "}to{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        currentPage * itemsPerPage,
                                        allSuppliers.length
                                    )}
                                </span>
                                {" "}of{" "}
                                <span className="font-medium">
                                    {allSuppliers.length}
                                </span>
                                {" "}suppliers
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === index + 1
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                                    }
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
        </div>
    )
}
