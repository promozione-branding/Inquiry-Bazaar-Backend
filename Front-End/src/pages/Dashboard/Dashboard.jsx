import React, { useEffect, useRef, useState } from "react";
import SideBar from "../../components/SideBar";
import {
  Users,
  Store,
  MessageSquareMore,
  FolderPlus,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../../components/Header";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [openSideBar, setOpenSideBar] = useState(false);
  const stats = [
    {
      title: "Total Sellers",
      value: "245",
      icon: Store,
    },
    {
      title: "Total Buyers",
      value: "1,280",
      icon: Users,
    },
    {
      title: "Categories",
      value: "36",
      icon: FolderPlus,
    },
    {
      title: "Inquiries",
      value: "89",
      icon: MessageSquareMore,
    },
  ];
  // console.log(user)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar open={openSideBar} setOpen={setOpenSideBar} />

      <div className="flex-1">
        <Header user={user} name={"Dashboard"} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

        <main className="md:p-6 p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500">{item.title}</p>
                      <h2 className="text-3xl font-bold mt-2">
                        {item.value}
                      </h2>
                    </div>

                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Inquiries */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Recent Inquiries
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Name</th>
                    <th className="text-left py-3">Email</th>
                    <th className="text-left py-3">Category</th>
                    <th className="text-left py-3">Status</th>
                  </tr>
                </thead>

                <tbody>

                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}