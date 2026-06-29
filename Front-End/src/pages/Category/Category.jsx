import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../../components/SideBar';
import Header from '../../components/Header';
import CategoryGrid from '../../components/Category/CategoryGrid';
import axios from 'axios';
import toast from "react-hot-toast";
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./category.css";

export default function Category() {
  const { user } = useSelector((state) => state.auth);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    // setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/industries/tree`);
      // console.log(res.data.data);
      setIndustries(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this industry?"
    );

    if (!confirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/industries/delete/${id}`, { withCredentials: true, });
      toast.success("Industry deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete industry");
    }
  };

  const handleDeleteCat = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/categories/delete/${id}`, { withCredentials: true, });
      toast.success("Category deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete industry");
    }
  };

  // Search Industry → Category → SubCategory
  const filteredIndustries = useMemo(() => {
    if (!search.trim()) return industries;
    const keyword = search.toLowerCase();

    return industries.map((industry) => {
      const industryMatch = industry.name?.toLowerCase().includes(keyword);

      const categories = industry.categories?.map((cat) => {
        const categoryMatch = cat.name?.toLowerCase().includes(keyword);

        const subCategories = cat.subCategories?.filter((sub) =>
          sub.name?.toLowerCase().includes(keyword)) || [];

        if (categoryMatch || subCategories.length > 0 || industryMatch) {
          return {
            ...cat,
            subCategories: industryMatch || categoryMatch ? cat.subCategories : subCategories,
          };
        }

        return null;
      }).filter(Boolean) || [];

      if (industryMatch || categories.length > 0) {
        return {
          ...industry,
          categories: industryMatch
            ? industry.categories
            : categories,
        };
      }

      return null;
    }).filter(Boolean);
  }, [industries, search]);

  console.log(filteredIndustries, search)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar open={openSideBar} setOpen={setOpenSideBar} />

      <div className="flex-1">
        <Header user={user} name={"Category"} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

        <main className="md:p-6 p-4">
          <div className='mb-4 bg-white rounded-xl flex justify-between items-center px-4 py-3'>
            <div className='flex gap-2 items-center'>
              <Link to={"/add-industry"} className='bg-orange-500 hover:bg-orange-600 p-2 text-white flex items-center rounded-md gap-1'>
                <Plus size={18} /> Add Industry
              </Link>
              <Link to={"/add-category"} className='bg-blue-500 hover:bg-blue-600 p-2 text-white flex items-center rounded-md gap-1'>
                <Plus size={18} /> Add Category
              </Link>
            </div>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          <CategoryGrid loading={loading} industries={filteredIndustries} handleDelete={handleDelete} handleDeleteCat={handleDeleteCat} />
        </main>
      </div>
    </div>
  )
}
