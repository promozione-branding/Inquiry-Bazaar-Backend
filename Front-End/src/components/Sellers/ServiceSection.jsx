import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import CommonModal from '../Modal';
import { locations } from '../../data/data';
import axios from 'axios';

export default function ServiceSection({ supplierData, fetchData }) {
    const [openModal, setOpenModal] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");

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
    return (
        <div>
            <h3 className="font-semibold mb-4 flex gap-2 items-center">
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
                            ✕
                        </button>
                    </span>))}
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
        </div>
    )
}
