import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import SideBar from '../../../components/SideBar';
import Header from '../../../components/Header';
import { Send } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

export default function Reply() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [openSideBar, setOpenSideBar] = useState(false);
    const [reply, setReply] = useState("");
    const [status, setStatus] = useState("IN PROGRESS");
    const [help, setHelp] = useState([])

    useEffect(() => {
        const fetchHelp = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/help/${id}`,
                    { withCredentials: true, }
                );
                console.log(res.data);
                setHelp(res.data.data);
            } catch (err) {
                console.log(err);
            }
        };

        if (id) {
            fetchHelp();
        }
    }, [id]);

    useEffect(() => {
        if (help) {
            setReply(help.adminReply || "");
            setStatus(
                help.status ||
                "IN PROGRESS"
            );
        }
    }, [help]);

    const handleReply = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/help/reply/${id}`,
                { reply, status, },
                { withCredentials: true, }
            );
            alert("Reply sent");
            navigate("/help");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar open={openSideBar} setOpen={setOpenSideBar} />

            <div className="flex-1">
                <Header user={user} name={"User Help"} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

                <main className="p-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-300 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    {help?.userId?.profileImage ? (
                                        <img
                                            src={help.userId?.profileImage}
                                            alt={help.userId?.name}
                                            className="w-15 h-15 rounded-full object-cover border-2 border-white shadow"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full text-lg bg-linear-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                                            {(help.userId?.business?.companyName?.charAt(0) || help.userId?.name?.charAt(0) || "?").toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {help.userId?.name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {help.userId?.email}
                                        </p>

                                        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                                            {help.userId?.role}
                                        </span>
                                    </div>

                                </div>
                                <div>
                                    {new Date(help.createdAt).toLocaleDateString()}
                                    <br />
                                    <span className="text-xs">
                                        {new Date(help.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        Subject
                                    </h3>

                                    <div className="bg-gray-100 rounded-xl p-4">
                                        {help?.subject}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        User Message
                                    </h3>

                                    <div className="bg-gray-100 rounded-xl p-5 text-gray-700 leading-7">
                                        {help.description}
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Update Status
                                    </label>

                                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500">
                                        <option value="OPEN">OPEN</option>
                                        <option value="IN PROGRESS">IN PROGRESS</option>
                                        <option value="RESOLVED">RESOLVED</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Reply
                                    </label>

                                    <textarea
                                        rows={8} value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Write your response..."
                                        className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={handleReply}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
                                        <Send size={18} />
                                        Send Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
