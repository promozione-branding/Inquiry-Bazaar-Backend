import React, { useState } from "react";
import { useSelector } from "react-redux";
import SideBar from "../../SideBar";
import Header from "../../Header";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, } from "react";

export default function EditIndustry() {
    const { id } = useParams()
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [openSideBar, setOpenSideBar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        metaTitle: "",
        metaDescription: "",
        image: null,
        imageAlt: "",
    });

    const [preview, setPreview] = useState("");
    useEffect(() => {
        fetchIndustry();
    }, []);

    const fetchIndustry = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/industries/get/${id}`, { withCredentials: true, });
            setFormData({
                name: res.data.name,
                metaTitle: res.data.metaTitle,
                imageAlt: res.data.imageAlt,
                metaDescription: res.data.metaDescription,
                image: null,
            });
            setPreview(res.data.imageUrl);
        } catch (error) {
            toast.error("Failed to load");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFormData({
            ...formData,
            image: file,
        });

        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("imageAlt", formData.imageAlt);
            payload.append("metaTitle", formData.metaTitle);
            payload.append("metaDescription", formData.metaDescription);

            if (formData.image) {
                payload.append("file", formData.image);
            }

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/industries/edit/${id}`,
                payload, { withCredentials: true, }
            );
            toast.success("Industry Updated");
            navigate("/all-category");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar open={openSideBar} setOpen={setOpenSideBar} />

            <div className="flex-1">
                <Header user={user} name="Edit Industry" openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

                <main className="p-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-5">
                        <h2 className="text-2xl font-bold text-[#0e2347] mb-5 text-center">
                            Edit Industry
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Industry Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter industry name"
                                    className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Industry Image
                                </label>

                                <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="preview"
                                            className="w-48 h-48 object-cover rounded-xl"
                                        />
                                    ) : (
                                        <>
                                            <Upload
                                                size={40}
                                                className="text-gray-400 mb-3"
                                            />

                                            <p className="text-gray-500">
                                                Click to upload image
                                            </p>
                                        </>
                                    )}

                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImage}
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Image Alt Text
                                </label>

                                <input
                                    type="text"
                                    name="imageAlt"
                                    value={formData.imageAlt}
                                    onChange={handleChange}
                                    placeholder="Image Alt"
                                    className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Meta Title
                                </label>

                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    placeholder="SEO Meta Title"
                                    className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Meta Description
                                </label>

                                <textarea
                                    rows="5"
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    placeholder="SEO Meta Description"
                                    className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" disabled={loading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md font-semibold transition"
                                >
                                    {loading ? "Saving..." : "Edit Industry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}