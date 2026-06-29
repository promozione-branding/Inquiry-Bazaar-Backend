import { Plus, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import CommonModal from '../Modal';
import { locations } from '../../data/data';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ServiceSection({ supplierData, fetchData, id }) {
    const [openModal, setOpenModal] = useState(false);
    const [openModalCategory, setOpenModalCategory] = useState(null);
    const [selectedCity, setSelectedCity] = useState("");
    const [supplierProducts, setSupplierProducts] = useState([]);
    const [supplierCatLocation, setSupplierCatLocation] = useState([]);

    const addLocation = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/add/service-location/${supplierData._id}`,
                { city: selectedCity, }, { withCredentials: true, }
            );

            setOpenModal(false);
            setSelectedCity("");
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const removeLocation = async (city) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove "${city}" from service locations?`
        );

        if (!confirmed) return;

        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/remove/service-location/${supplierData._id}`,
                { data: { city }, withCredentials: true, }
            );

            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/supplier/${id}`, { withCredentials: true, });
            // console.log(res?.data?.data)
            setSupplierProducts(res?.data?.data?.products)
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategoryLocation = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/coverage/${id}`,
                { withCredentials: true, }
            );
            setSupplierCatLocation(res?.data?.data);
        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {
        fetchCategoryLocation()
        fetchProduct()
    }, [id]);

    const addCategoryLocation = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/categories/coverage`,
                { city: selectedCity, supplierId: id, subCategoryId: openModalCategory?._id }, { withCredentials: true, }
            );

            setOpenModalCategory(null);
            setSelectedCity("");
            toast.success("Location Added");
            fetchCategoryLocation()
        } catch (error) {
            console.log(error);
        }
    };

    const removeCategoryLocation = async (city, sub) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove "${city}" from ${sub?.name}?`
        );

        if (!confirmed) return;
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/categories/coverage`, {
                data: { supplierId: id, subCategoryId: sub?._id, city, }, withCredentials: true,
            });

            fetchCategoryLocation();
            toast.success("Location Removed");
        } catch (error) {
            console.log(error);
        }
    };

    // console.log(supplierCatLocation)

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div className='shadow-sm py-3 px-4 rounded-md border border-gray-200'>
                <h3 className="font-semibold mb-4  flex gap-2 items-center">
                    Service Locations
                    <button onClick={() => setOpenModal(true)} className='p-2 rounded-md bg-blue-200 hover:bg-blue-500 text-blue-600 hover:text-white transition'>
                        <Plus size={16} />
                    </button>
                </h3>

                <div className="flex flex-wrap gap-3">
                    {supplierData?.business?.serviceLocations?.map((location, index) => (
                        <span key={index} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                            {location}
                            <button onClick={() => removeLocation(location)} className="text-red-500 hover:text-red-700">
                                <X size={16} />
                            </button>
                        </span>))}
                </div>
            </div>

            <div className='shadow-sm py-3 px-4 rounded-md border border-gray-200 max-h-70 overflow-y-auto'>
                <div className='flex justify-between items-center mb-4'>
                    <h3 className="font-semibold flex gap-2 items-center">
                        Dealing in Categories
                    </h3>
                    <p className='text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-lg'>
                        Total Product : {supplierProducts?.length}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...new Map(supplierProducts?.filter((p) => p.subCategoryId)
                        .map((p) => [p.subCategoryId._id, p.subCategoryId,])).values(),].map((sub) => (
                            <div key={sub._id} className="rounded-lg border border-gray-300">
                                <div className='flex px-4 py-2 justify-between items-center text-blue-700 bg-gray-50 border-b border-gray-300 pb-2'>
                                    {sub.name}
                                    <button onClick={() => setOpenModalCategory(sub)} className='p-2 rounded-md bg-blue-200 hover:bg-blue-500 text-blue-600 hover:text-white transition'>
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-h-30 overflow-y-auto px-1 py-1'>
                                    {supplierCatLocation?.find(item => item.subCategoryId?._id === sub._id)
                                        ?.locations?.length ? (supplierCatLocation.find(item => item.subCategoryId?._id === sub._id)
                                            .locations.map((city, index) => (
                                                <div key={index} className="flex text-sm items-center gap-2 justify-center py-2 bg-green-100 text-green-700 rounded-lg">
                                                    {city}
                                                    <button onClick={() => removeCategoryLocation(city, sub)} className="text-red-500 hover:text-red-700">
                                                        <X size={16} className='mt-1' />
                                                    </button>
                                                </div>
                                            ))
                                    ) : (
                                        <p className='col-span-2 text-center py-2 flex justify-center items-center text-gray-600 text-sm'>
                                            No Locations Yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            <CommonModal isOpen={openModal} onClose={() => setOpenModal(false)} title="Add Service Location">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select City
                        </label>

                        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500">
                            <option value="">Select City</option>
                            {locations.flatMap(state => state.cities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            )))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setOpenModal(false)}
                            className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>

                        <button onClick={addLocation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add Location
                        </button>
                    </div>
                </div>
            </CommonModal>

            <CommonModal isOpen={openModalCategory} onClose={() => setOpenModalCategory(null)} title={`Add Service in ${openModalCategory?.name}`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select City
                        </label>

                        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500">
                            <option value="">Select City</option>
                            {locations.flatMap(state => state.cities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            )))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setOpenModalCategory(null)}
                            className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>

                        <button onClick={addCategoryLocation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add Location
                        </button>
                    </div>
                </div>
            </CommonModal>
        </div>
    )
}