import React, { useState } from 'react'
import CommonModal from '../../components/Modal'
import { Plus } from 'lucide-react'
import toast from "react-hot-toast";
import axios from 'axios';

export default function ProductSection({ supplierProducts, fetchProduct }) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [newAltText, setNewAltText] = useState("");

    const handleImageClick = (data) => {
        setSelectedImage(data);
        setNewAltText(data?.altName || "");
    };

    const handleAddAlt = async () => {
        if (!newAltText.trim()) {
            toast.error("Alt text is required");
            return;
        }

        try {
            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/product/media/${selectedImage.id}`,
                { altName: newAltText, }
            );

            if (data.success) {
                setSelectedImage((prev) => ({
                    ...prev,
                    altName: newAltText,
                }));
                fetchProduct()
                toast.success("Alt text updated");
                setNewAltText("");
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Failed to update alt text");
        }
    };

    return (
        <>
            <div>
                {supplierProducts?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {supplierProducts.map((product) =>
                            product?.media?.map((img, index) => (
                                <div key={`${product._id}-${index}`}
                                    className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden"
                                >
                                    {/* Image */}
                                    <div className="p-3">
                                        <img
                                            src={img?.url}
                                            alt={img?.altName || product.name}
                                            onClick={() =>
                                                handleImageClick({
                                                    id: img._id,
                                                    url: img?.url,
                                                    altName: img?.altName,
                                                    productName: product.name,
                                                })}
                                            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:scale-[1.02] transition"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="px-4 pb-4 text-center space-y-1">
                                        <h2 className="font-semibold text-gray-900">
                                            {product.name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {img.altName || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-20 bg-white rounded-lg">
                        No products found
                    </div>
                )}
            </div>

            {/* Modal */}
            <CommonModal
                isOpen={!!selectedImage}
                onClose={() => {
                    setSelectedImage(null)
                    setNewAltText("")
                }}
                title={selectedImage?.productName}
                maxWidth="max-w-3xl"
            >
                {selectedImage && (
                    <div className="space-y-5">
                        {/* Image */}
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.altName}
                            className="w-full max-h-[50vh] object-contain rounded-lg"
                        />

                        {/* Existing Info */}
                        <div className="bg-gray-100 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-3">
                            <div>
                                <p className="font-semibold text-lg">
                                    Name: {selectedImage.productName}
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

                        {/* Input */}
                        <div className="flex flex-col md:flex-row gap-3 items-center">
                            <input
                                value={newAltText}
                                onChange={(e) => setNewAltText(e.target.value)}
                                placeholder="Add New Alt Text"
                                type="text"
                                className="flex-1 border border-gray-300 shadow-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                            />

                            <button onClick={handleAddAlt}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={18} />
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </CommonModal>
        </>
    )
}