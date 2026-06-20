import axios from "axios";
import React, { useEffect, useState, } from "react";
import CommonModal from "../../components/Modal";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function WebpageSection({ id, }) {
    const [supplierWebpage, setSupplierWebpage,] = useState(null);
    const [loading, setLoading,] = useState(true);
    const [selectedImage, setSelectedImage,] = useState(null);
    const [newAltText, setNewAltText,] = useState("");

    const fetchWebpage = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/webpage/user/${id}`,
                { withCredentials: true, }
            );

            setSupplierWebpage(res?.data?.data?.webpage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchWebpage();
        }
    }, [id]);

    const handleClick = (item) => {
        setSelectedImage(item);
        setNewAltText(item.alt || "");
    };

    const handleSave = async () => {
        if (!newAltText.trim()) return;

        try {
            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/webpage/alt/${supplierWebpage._id}/`,
                { section: selectedImage.section, imageAlt: newAltText, },
                { withCredentials: true, }
            );
            if (data.success) {
                setSupplierWebpage((prev) => ({
                    ...prev,
                    [selectedImage.section]: {
                        ...prev[selectedImage.section],
                        imageAlt: newAltText,
                    },
                }));

                setSelectedImage((prev) => ({
                    ...prev,
                    alt: newAltText,
                }));
                setSelectedImage(null)
                toast.success("Alt text updated");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const images = [
        {
            section: "hero",
            title: "Hero",
            image: supplierWebpage?.hero?.image,
            alt: supplierWebpage?.hero?.imageAlt,
        },
        {
            section: "about",
            title: "About",
            image: supplierWebpage?.about?.image,
            alt: supplierWebpage?.about?.imageAlt,
        },
        {
            section: "faqSection",
            title: "FAQ",
            image: supplierWebpage?.faqSection?.image,
            alt: supplierWebpage?.faqSection?.imageAlt,
        },
    ].filter((i) => i.image);

    if (loading) return (
        <div className="py-20 text-center">
            Loading...
        </div>
    );

    // console.log(images, supplierWebpage)

    return (
        <>
            <div className="grid grid-cols-3 gap-6">
                {images.map((item) => (
                    <div key={item.section} className="bg-white rounded-xl overflow-hidden shadow">
                        <img
                            src={item.image}
                            alt={item.alt}
                            onClick={() => handleClick(item)}
                            className="h-72 w-full object-cover cursor-pointer"
                        />

                        <div className="p-4">
                            <h3 className="font-semibold">
                                {item.title}
                            </h3>

                            <p className="text-gray-500">
                                {item.alt || "No alt"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <CommonModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                title={selectedImage?.title}
                maxWidth="max-w-2xl"
            >
                {selectedImage && (
                    <div className="space-y-5">
                        <img src={selectedImage.image} alt={selectedImage.altName}
                            className="w-full max-h-[50vh] object-contain rounded-lg"
                        />

                        {/* Existing Info */}
                        <div className="bg-gray-100 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-3">
                            <div>
                                <p className="font-semibold text-lg">
                                    Name: {selectedImage.title}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-700">
                                    Alt Text:
                                    <span className="ml-2 font-medium">
                                        {selectedImage.altName || "No alt text available"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-center">
                            <input
                                value={newAltText}
                                onChange={(e) => setNewAltText(e.target.value)}
                                className="flex-1 border border-gray-300 shadow-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                            />

                            <button onClick={handleSave}
                                className="bg-blue-600 text-white px-5 py-3 rounded flex items-center gap-2"
                            >
                                <Plus />
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </CommonModal>
        </>
    );
}