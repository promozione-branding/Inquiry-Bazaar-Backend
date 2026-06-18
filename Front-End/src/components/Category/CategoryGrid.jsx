import { Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CategoryGrid({ industries = [], handleDelete, handleDeleteCat, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-300 p-5 animate-pulse"
                    >
                        <div className="flex gap-4">
                            <div className="w-28 h-28 bg-gray-200 rounded-xl" />

                            <div className="flex-1 space-y-3">
                                <div className="h-6 w-48 bg-gray-200 rounded" />
                                <div className="h-4 w-28 bg-gray-200 rounded" />
                            </div>

                            <div className="flex gap-2">
                                <div className="w-10 h-10 bg-gray-200 rounded-md" />
                                <div className="w-10 h-10 bg-gray-200 rounded-md" />
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-4 mt-6">
                            {[...Array(2)].map((_, j) => (
                                <div
                                    key={j}
                                    className="border border-gray-300 rounded-xl p-4 space-y-3"
                                >
                                    <div className="h-5 w-32 bg-gray-200 rounded" />

                                    <div className="grid grid-cols-3 gap-2">
                                        {[...Array(6)].map((_, k) => (
                                            <div
                                                key={k}
                                                className="h-28 bg-gray-200 rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!industries.length) {
        return (
            <div className="bg-white rounded-xl py-20 text-center">
                <p className="text-gray-500 text-lg">
                    No categories found
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-8">
            {industries.map((industry) => (
                <div key={industry._id} className="bg-white rounded-2xl shadow border border-gray-300 overflow-hidden">
                    {/* Industry Banner */}
                    <div className="p-4 border-b border-gray-300">
                        <div className="flex flex-col md:flex-row items-center gap-5">
                            <img
                                src={industry.imageUrl}
                                alt={industry.name}
                                className="w-28 h-28 rounded-xl object-cover border border-gray-300"
                            />

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">
                                    {industry.name}
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    {industry.categories?.length || 0} Categories
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {/* <Link to={"/add-category"} className="bg-blue-500 hover:bg-blue-600 rounded-md text-white p-2">
                                    <Plus size={18} />
                                </Link> */}

                                <Link to={`/edit-industry/${industry._id}`} className="bg-green-500 hover:bg-green-600 rounded-md text-white p-2">
                                    <Edit size={18} />
                                </Link>

                                <button onClick={() => handleDelete(industry._id)} className="bg-red-500 hover:bg-red-600 rounded-md text-white p-2">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="p-4 grid lg:grid-cols-2 gap-5">
                        {industry.categories?.map((category) => (
                            <div key={category._id} className="border border-gray-300 rounded-xl overflow-hidden">
                                <div className="p-2 bg-gray-50 border-b border-gray-300">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">
                                                {category.name}
                                            </h3>
                                        </div>

                                        <div className="flex gap-1">
                                            {/* <button className="bg-blue-500 hover:bg-blue-600 rounded-md text-white p-2">
                                                <Plus size={14} />
                                            </button> */}

                                            <Link to={`/edit-category/${category._id}`} className="bg-green-500 hover:bg-green-600 rounded-md text-white p-2">
                                                <Edit size={14} />
                                            </Link>

                                            <button onClick={() => handleDeleteCat(category._id)} className="bg-red-500 hover:bg-red-600 rounded-md text-white p-2">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {category.subCategories?.map((sub) => (
                                            <div
                                                key={sub._id}
                                                className="relative border border-gray-300 rounded-lg p-2 text-center hover:shadow-md transition group"
                                            >
                                                {/* Hover Actions */}
                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Link to={`/edit-category/${sub._id}`}
                                                        className="bg-green-500 hover:bg-green-600 rounded-md text-white p-2"
                                                    >
                                                        <Edit size={14} />
                                                    </Link>

                                                    <button onClick={() => handleDeleteCat(sub._id)} className="bg-red-500 hover:bg-red-600 rounded-md text-white p-2">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                <img
                                                    src={sub.imageUrl}
                                                    alt={sub.name}
                                                    className="w-full h-20 object-cover rounded-md"
                                                />

                                                <p className="text-sm font-medium p-2">
                                                    {sub.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}