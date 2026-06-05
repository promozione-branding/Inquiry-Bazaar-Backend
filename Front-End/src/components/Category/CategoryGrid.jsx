import { Plus, Edit, Trash2 } from "lucide-react";

export default function CategoryGrid({ industries = [] }) {
    return (
        <div className="space-y-8">
            {industries.map((industry) => (
                <div key={industry._id}
                    className="bg-white rounded-2xl shadow border border-gray-300 overflow-hidden"
                >
                    {/* Industry Banner */}
                    <div className="p-6 border-b border-gray-300">
                        <div className="flex flex-col md:flex-row items-center gap-5">
                            <img
                                src={industry.imageUrl}
                                alt={industry.name}
                                className="w-28 h-28 rounded-xl object-cover border"
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
                                <button className="icon-btn-blue">
                                    <Plus size={18} />
                                </button>

                                <button className="icon-btn-red">
                                    <Edit size={18} />
                                </button>

                                <button className="icon-btn-danger">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="p-6 grid lg:grid-cols-2 gap-6">
                        {industry.categories?.map((category) => (
                            <div
                                key={category._id}
                                className="border border-gray-300 rounded-xl overflow-hidden"
                            >
                                {/* Category */}
                                <div className="p-4 bg-gray-50 border-b border-gray-300">
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
                                            <button className="mini-btn-blue">
                                                <Plus size={14} />
                                            </button>

                                            <button className="mini-btn-blue">
                                                <Edit size={14} />
                                            </button>

                                            <button className="mini-btn-danger">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub Categories */}
                                <div className="p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {category.subCategories?.map((sub) => (
                                            <div
                                                key={sub._id}
                                                className="border border-gray-300 rounded-lg p-2 text-center hover:shadow-md transition"
                                            >
                                                <img
                                                    src={sub.imageUrl}
                                                    alt={sub.name}
                                                    className="w-full h-20 object-cover rounded-md mb-2"
                                                />

                                                <p className="text-sm font-medium">
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