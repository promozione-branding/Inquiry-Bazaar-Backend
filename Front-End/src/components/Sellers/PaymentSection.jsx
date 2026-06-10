import axios from 'axios';
import { BadgeCheck, Calendar, Clock, CreditCard, FileText, IndianRupee, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export default function PaymentSection({ InfoItem, id }) {
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        membershipType: "",
        membershipStatus: "pending",
        paymentMethod: "",
        amountPaid: "",
        transactionId: "",
        paymentDate: "",
        startDate: "",
        endDate: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const getMembership = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/membership/get/${id}`, { withCredentials: true, });
            console.log(res.data.data)
            if (res.data.data) {
                setMembership(res.data.data);
                setFormData({
                    membershipType: res.data.data.membershipType || "",
                    membershipStatus: res.data.data.membershipStatus || "",
                    paymentMethod: res.data.data.paymentMethod || "",
                    amountPaid: res.data.data.amountPaid || "",
                    transactionId: res.data.data.transactionId || "",
                    paymentDate: res.data.data.paymentDate?.split("T")[0] || "",
                    startDate: res.data.data.startDate?.split("T")[0] || "",
                    endDate: res.data.data.endDate?.split("T")[0] || "",
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMembership();
    }, [id]);

    const saveMembership = async () => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/membership/add/${id}`, formData, { withCredentials: true, });
            setMembership(res.data.data);
            setEditMode(false);
            getMembership()
            alert("Membership Saved");
        } catch (error) {
            console.log(error);
        }
    };

    return (<>
        {membership && !editMode && (
            <div className="space-y-4">
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-bold capitalize">
                                {membership?.membershipType} Membership
                            </h3>

                            <p className="text-blue-100 mt-1">
                                {membership?.membershipStatus === "active"
                                    ? "Active Subscription"
                                    : membership?.membershipStatus === "expired"
                                        ? "Expired Subscription" : "Pending Approval"}
                            </p>
                        </div>

                        <div className={`px-4 py-2 rounded-full text-sm font-medium capitalize
            ${membership?.membershipStatus === "active"
                                ? "bg-blue-400/60 text-white border border-blue-200"
                                : membership?.membershipStatus === "expired"
                                    ? "bg-red-500/60 text-white border border-red-200"
                                    : "bg-yellow-400/60 text-white border border-yellow-200"
                            }`}
                        >
                            {membership?.membershipStatus}
                        </div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
                    <InfoItem
                        icon={<BadgeCheck size={18} />}
                        label="Membership Type"
                        value={membership?.membershipType}
                    />

                    <InfoItem
                        icon={<CreditCard size={18} />}
                        label="Payment Method"
                        value={membership?.paymentMethod}
                    />

                    <InfoItem
                        icon={<IndianRupee size={18} />}
                        label="Amount Paid"
                        value={`₹${membership?.amountPaid || 0}`}
                    />

                    <InfoItem
                        icon={<FileText size={18} />}
                        label="Transaction ID"
                        value={membership?.transactionId}
                    />

                    <InfoItem
                        icon={<Calendar size={18} />}
                        label="Start Date"
                        value={membership?.startDate ? new Date(membership.startDate).toLocaleDateString("en-IN") : "-"}
                    />

                    <InfoItem
                        icon={<Calendar size={18} />}
                        label="End Date"
                        value={membership?.endDate ? new Date(membership.endDate).toLocaleDateString("en-IN") : "-"}
                    />

                    <InfoItem
                        icon={<User size={18} />}
                        label="Approved By"
                        value={membership?.approvedBy?.name || "-"}
                    />

                    <InfoItem
                        icon={<Clock size={18} />}
                        label="Payment Date"
                        value={membership?.paymentDate ? new Date(membership.paymentDate).toLocaleDateString("en-IN") : "-"}
                    />

                    {membership?.invoice?.url && (
                        <div className="bg-white border rounded-xl p-4 shadow-sm">
                            <p className="text-sm text-gray-500 mb-2">
                                Invoice / Receipt
                            </p>

                            <a
                                href={membership.invoice.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <FileText size={18} />
                                View Invoice
                            </a>
                        </div>
                    )}
                </div>
            </div>)}

        {(!membership || editMode) && (
            <div className="grid md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Membership Type
                    </label>

                    <select name="membershipType" value={formData.membershipType} onChange={(e) => handleChange(e)}
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500">
                        <option value="">Select Membership</option>
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="pro">Pro</option>
                        <option value="elite">Elite</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Membership Status
                    </label>

                    <select name="membershipStatus" value={formData.membershipStatus} onChange={(e) => handleChange(e)}
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500">
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Payment Method
                    </label>

                    <select name="paymentMethod" value={formData.paymentMethod} onChange={(e) => handleChange(e)}
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500">
                        <option value="">Select Method</option>
                        <option value="upi">UPI</option>
                        <option value="cheque">Cheque</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Amount Paid
                    </label>

                    <input
                        onChange={(e) => handleChange(e)}
                        type="number"
                        name="amountPaid"
                        value={formData.amountPaid}
                        placeholder="Enter Amount"
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Transaction ID / Cheque No.
                    </label>

                    <input
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={(e) => handleChange(e)}
                        type="text"
                        placeholder="Enter Transaction ID"
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Payment Date
                    </label>

                    <input
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={(e) => handleChange(e)}
                        type="date"
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Membership Start Date
                    </label>

                    <input
                        name="startDate"
                        value={formData.startDate}
                        onChange={(e) => handleChange(e)}
                        type="date"
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Membership End Date
                    </label>

                    <input
                        name="endDate"
                        value={formData.endDate}
                        onChange={(e) => handleChange(e)}
                        type="date"
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                        Upload Invoice / Receipt
                    </label>

                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3"
                    />
                </div>
            </div>)}


        {editMode || !membership ? (
            <div className="flex justify-end items-center gap-3 mt-6">
                {membership && (
                    <button type="button" onClick={() => setEditMode(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                )}

                <button type="button" onClick={saveMembership}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    {membership ? "Update" : "Create"}
                </button>
            </div>
        ) : (
            <div className="flex justify-end mt-6">
                <button type="button" onClick={() => setEditMode(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Edit Membership
                </button>
            </div>
        )}
    </>)
}
