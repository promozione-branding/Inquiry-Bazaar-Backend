import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Header from '../../../components/Header';
import SideBar from '../../../components/SideBar';
import axios from 'axios';
import { Plus, Search } from 'lucide-react';
import ProductSection from '../../../components/Sellers/ProductSection';
import WebpageSection from '../../../components/Sellers/WebpageSection';

export default function SellerImages() {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [openSideBar, setOpenSideBar] = useState(false);
    const [supplierData, setSupplierData] = useState([]);
    const [supplierProducts, setSupplierProducts] = useState([]);
    const [tab, setTab] = useState("products");

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/supplier/${id}`, { withCredentials: true, });
            // console.log(res?.data?.data)
            setSupplierProducts(res?.data?.data?.products)
            // setSupplierData(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/${id}`, { withCredentials: true, });
                // console.log(res.data.data)
                setSupplierData(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProduct()
        fetchDetails()
    }, [user, id]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar open={openSideBar} setOpen={setOpenSideBar} />

            <div className="flex-1">
                <Header user={user} name={`${supplierData.name || "Loading..."}`} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

                <main className="p-4">
                    <div className='mb-4 bg-white rounded-xl flex justify-between items-center px-4 py-3'>
                        <div className='flex gap-2 items-center'>
                            <button onClick={() => setTab("products")} className='bg-orange-500 hover+:bg-orange-600 px-3 py-2 text-white flex items-center rounded-md gap-1'>
                                Products Images
                            </button>
                            <button onClick={() => setTab("webpage")} className='bg-blue-500 hover:bg-blue-600 px-3 py-2 text-white flex items-center rounded-md gap-1'>
                                Webpage Images
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                        </div>
                    </div>

                    {tab == "products" &&
                        <ProductSection supplierProducts={supplierProducts} fetchProduct={fetchProduct} />}

                    {tab == "webpage" &&
                        <WebpageSection id={id} />}

                </main>
            </div>
        </div>
    )
}
