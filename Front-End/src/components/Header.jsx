import { Menu } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';

export default function Header({ user, name, openSideBar, setOpenSideBar }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button className='md:hidden block' onClick={() => setOpenSideBar(true)}>
                    <Menu size={28} />
                </button>
                <h1 className="text-2xl font-bold">{name || "Dashboard"}</h1>
            </div>

            <div className="flex flex-col items-center gap-3">
                <div ref={dropdownRef} className="relative">
                    {user.profileImage ? (
                        <img
                            onClick={() => setOpen((prev) => !prev)}
                            src={user.profileImage}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-gray-200 hover:ring-blue-400 transition"
                        />
                    ) : (
                        <button
                            onClick={() => setOpen((prev) => !prev)}
                            className="w-10 h-10 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center cursor-pointer hover:bg-blue-600 transition"
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </button>
                    )}

                    {open && (
                        <div className="absolute right-0 top-11 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                            <div className="p-2 text-center">
                                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>

                            <div className="border-t border-gray-300 flex flex-col">
                                <Link to="/profile" className="w-full px-4 py-2 text-left hover:bg-gray-50 transition border-b border-gray-300">
                                    Profile
                                </Link>

                                <Link to="/settings" className="w-full px-4 py-2 text-left hover:bg-gray-50 transition border-b border-gray-300">
                                    Settings
                                </Link>

                                <button className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 transition">
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
