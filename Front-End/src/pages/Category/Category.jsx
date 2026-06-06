import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../../components/SideBar';
import Header from '../../components/Header';
import CategoryGrid from '../../components/Category/CategoryGrid';
import axios from 'axios';

export default function Category() {
  const { user } = useSelector((state) => state.auth);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchData();
  }, []);
  // console.log(industries)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar open={openSideBar} setOpen={setOpenSideBar} />

      <div className="flex-1">
        <Header user={user} name={"Category"} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

        <main className="md:p-6 p-4">
          <CategoryGrid industries={industries} />
        </main>
      </div>
    </div>
  )
}
