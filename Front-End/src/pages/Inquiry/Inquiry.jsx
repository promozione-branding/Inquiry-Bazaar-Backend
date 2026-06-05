import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import SideBar from '../../components/SideBar';
import Header from '../../components/Header';
import axios from 'axios';

export default function Inquiry() {
    const { user } = useSelector((state) => state.auth);
    const [openSideBar, setOpenSideBar] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar open={openSideBar} setOpen={setOpenSideBar} />

            <div className="flex-1">
                <Header user={user} name={"All Inquiry"} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

                <main className="md:p-6 p-4">

                </main>
            </div>
        </div>
    )
}
