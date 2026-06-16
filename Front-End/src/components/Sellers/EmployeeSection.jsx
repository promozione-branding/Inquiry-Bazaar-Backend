import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeSection({ supplierData, fetchData, }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        empName: "",
        empEmail: "",
        empPhone: "",
        designation: "Account Manager",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev, [e.target.name]: e.target.value,
        }));
    };

    useEffect(() => {
        const getEmployee = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/assign-employee/${supplierData?._id}`,
                    { withCredentials: true, }
                );

                if (res.data.data) {
                    setFormData({
                        empName: res.data.data.empName || "",
                        empEmail: res.data.data.empEmail || "",
                        empPhone: res.data.data.empPhone || "",
                        designation: res.data.data.designation || "Account Manager",
                    });
                }
            } catch (err) {
                console.log(err);
            }
        };

        if (supplierData?._id) {
            getEmployee();
        }
    }, [supplierData]);

    const saveEmployee = async () => {
        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/assign-employee`, { userId: supplierData?._id, ...formData, },
                { withCredentials: true, }
            );

            alert("Employee saved");
            fetchData?.();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Emp Name
                </label>

                <input
                    name="empName"
                    value={formData.empName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter Employee Name"
                    className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Emp Email
                </label>

                <input
                    name="empEmail"
                    value={formData.empEmail}
                    onChange={handleChange}
                    type="email"
                    placeholder="Enter Employee Email"
                    className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Emp Phone
                </label>

                <input
                    name="empPhone"
                    value={formData.empPhone}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter Employee Phone"
                    className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
            </div>

            <div className="flex justify-end items-end">
                <button onClick={saveEmployee} disabled={loading}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {loading ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}