import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom"
import SideBar from '../../../components/SideBar';
import Header from '../../../components/Header';
import { useSelector } from 'react-redux';
import {
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaUsers,
  FaIndustry,
  FaPhoneAlt,
  FaWhatsapp,
  FaFilePdf,
  FaFileAlt,
  FaRupeeSign
} from "react-icons/fa";

import { BsTelegram } from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";
import { BadgeCheck, Building, Calendar, Calendar1, Clock, CreditCard, FileText, IndianRupee, Mail, MapPin, PhoneCall, PhoneIcon, Plus, User, Users } from 'lucide-react';
import PaymentSection from '../../../components/Sellers/PaymentSection';
import ServiceSection from '../../../components/Sellers/ServiceSection';

export default function SellerEdit() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [supplierData, setSupplierData] = useState([]);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const tabs = [
    {
      id: "personal",
      label: "Personal",
      icon: <FaUsers size={16} />
    },
    {
      id: "business",
      label: "Business",
      icon: <FaBuilding size={16} />
    },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard size={16} />
    },
    {
      id: "service",
      label: "Service Locations",
      icon: <MapPin size={16} />
    }
  ];

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/supplier/${id}`, { withCredentials: true, });
      console.log(res.data.data)
      setSupplierData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar open={openSideBar} setOpen={setOpenSideBar} />

      <div className="flex-1">
        <Header user={user} name={`${supplierData.name || "Loading..."}`} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />
        <main className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <img
                src={supplierData?.profileImage}
                alt={supplierData?.name}
                className="w-30 h-30 rounded-full object-cover border border-gray-300 shadow-md"
              />

              <div>
                <h2 className="text-2xl font-bold">{supplierData?.name}</h2>
                <p className="text-gray-600">{supplierData?.email}</p>
                <p className="text-gray-600">{supplierData?.phone}</p>

                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {supplierData?.business?.social?.linkedin && (
                    <a
                      href={supplierData.business.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-700 hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                    >
                      <FaLinkedin size={22} />
                    </a>
                  )}

                  {supplierData?.business?.social?.instagram && (
                    <a
                      href={supplierData.business.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                    >
                      <FaInstagram size={22} />
                    </a>
                  )}

                  {supplierData?.business?.social?.facebook && (
                    <a
                      href={supplierData.business.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                    >
                      <FaFacebook size={22} />
                    </a>
                  )}

                  {supplierData?.business?.social?.youtube && (
                    <a
                      href={supplierData.business.social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="YouTube"
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                    >
                      <FaYoutube size={22} />
                    </a>
                  )}

                  {supplierData?.business?.social?.telegram && (
                    <a
                      href={supplierData.business.social.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Telegram"
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-sky-50 text-sky-500 border border-sky-100 hover:bg-sky-500 hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                    >
                      <BsTelegram size={22} />
                    </a>
                  )}

                  {supplierData?.business?.social?.twitter && (
                    <a
                      href={supplierData.business.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="X (Twitter)"
                      className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 text-black border border-gray-200 hover:bg-black hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                    >
                      <FaXTwitter size={22} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-300 flex flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* PERSONAL */}
              {activeTab === "personal" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoItem icon={<User size={16} />} label="Name" value={supplierData?.name} />
                  <InfoItem icon={<User size={16} />} label="Role" value={supplierData?.role} />
                  <InfoItem icon={<Mail size={16} />} label="Email" value={supplierData?.email} />
                  <InfoItem icon={<PhoneCall size={16} />} label="Phone" value={supplierData?.phone} />
                  <InfoItem icon={<Mail size={16} />} label="Alt Email" value={supplierData?.otherEmail} />
                  <InfoItem icon={<PhoneIcon size={16} />} label="Alt Phone" value={supplierData?.otherPhone} />
                  <InfoItem icon={<Calendar1 size={16} />} label="Created At" value={supplierData?.createdAt ? new Date(supplierData.createdAt).toLocaleDateString() : "-"} />
                </div>
              )}

              {/* BUSINESS */}
              {activeTab === "business" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoItem
                    icon={<Building size={16} />}
                    label="Company Name"
                    value={supplierData?.business?.companyName}
                  />

                  <InfoItem
                    icon={<User size={16} />}
                    label="CEO Name"
                    value={supplierData?.business?.ceoName}
                  />

                  <InfoItem
                    icon={<Building size={16} />}
                    label="Business Type"
                    value={supplierData?.business?.businessType}
                  />

                  <InfoItem
                    icon={<Building size={16} />}
                    label="Business Field"
                    value={supplierData?.business?.businessField}
                  />

                  <InfoItem
                    icon={<FaFileAlt size={16} />}
                    label="GST Number"
                    value={supplierData?.business?.gstNumber}
                  />

                  <InfoItem
                    icon={<Building size={16} />}
                    label="Ownership Type"
                    value={supplierData?.business?.ownershipType}
                  />

                  <InfoItem
                    icon={<Users size={16} />}
                    label="Employees"
                    value={supplierData?.business?.numberOfEmployees || "-"}
                  />

                  <InfoItem
                    icon={<FaRupeeSign size={16} />}
                    label="Annual Turnover"
                    value={supplierData?.business?.annualTurnover || "-"}
                  />

                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="City"
                    value={supplierData?.business?.city}
                  />

                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="State"
                    value={supplierData?.business?.state}
                  />

                  <div className="md:col-span-2">
                    <InfoItem
                      icon={<MapPin size={16} />}
                      label="Address"
                      value={supplierData?.business?.address}
                    />
                  </div>
                </div>
              )}

              {/* PAYMENT */}
              {activeTab === "payment" && (
                <PaymentSection InfoItem={InfoItem} id={supplierData?._id} />
              )}

              {/* SERVICE LOCATION */}
              {activeTab === "service" && (
                <ServiceSection supplierData={supplierData} fetchData={fetchData} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const InfoItem = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center gap-2 text-gray-700 mb-1">
      {icon}
      <p className="text-sm">{label}</p>
    </div>

    <p className="font-semibold text-gray-800 capitalize">
      {value || "-"}
    </p>
  </div>
);