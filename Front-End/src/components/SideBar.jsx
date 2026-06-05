import React, { useState } from "react";
import {
  LayoutDashboard,
  FolderPlus,
  CircleHelp,
  Store,
  Users,
  MessageSquareMore,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SideBar({ open, setOpen }) {

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Add Category", path: "/add-category", icon: FolderPlus },
    { name: "All Sellers", path: "/sellers", icon: Store },
    { name: "All Buyers", path: "/buyers", icon: Users },
    { name: "Inquiry", path: "/inquiry", icon: MessageSquareMore },
    { name: "Help", path: "/help", icon: CircleHelp },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          w-64 md:h-auto h-full bg-slate-900 text-white shadow-lg
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Panel</h2>

          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link to={item.path} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200"
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}