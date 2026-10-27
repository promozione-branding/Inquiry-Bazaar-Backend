
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import SideBar from "../../components/SideBar";
import Header from "../../components/Header";

import {
    UserRound,
    Mail,
    Phone,
    ShieldCheck,
    LockKeyhole,
    Pencil,
    Save,
    X,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    AlertCircle,
    CalendarDays,
    Clock3,
    KeyRound,
    UserCog,
} from "lucide-react";

const API = import.meta.env.VITE_BACKEND_URL;

const initialProfile = {
    name: "",
    email: "",
    phone: "",
    otherEmail: "",
    otherPhone: "",
    profileImage: "",
};

const initialPassword = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const profileFields = [
    {
        name: "name",
        label: "Full Name",
        type: "text",
        icon: UserRound,
        required: true,
    },
    {
        name: "email",
        label: "Email Address",
        type: "email",
        icon: Mail,
        required: true,
    },
    {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        icon: Phone,
    },
    {
        name: "otherEmail",
        label: "Alternate Email",
        type: "email",
        icon: Mail,
    },
    {
        name: "otherPhone",
        label: "Alternate Phone",
        type: "tel",
        icon: Phone,
    },
    {
        name: "profileImage",
        label: "Profile Image URL",
        type: "url",
        icon: UserRound,
    },
];

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

function ProfileField({
    field,
    value,
    editing,
    onChange,
}) {
    const Icon = field.icon;

    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                {field.label}
            </label>

            <div className="relative">
                <Icon
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                {editing ? (
                    <input
                        type={field.type}
                        name={field.name}
                        value={value || ""}
                        onChange={onChange}
                        required={field.required}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                ) : (
                    <div className="flex min-h-12 items-center break-all rounded-xl border border-gray-100 bg-gray-50 py-3 pl-12 pr-4 text-sm font-medium text-gray-800">
                        {value || "-"}
                    </div>
                )}
            </div>
        </div>
    );
}

function PasswordInput({
    label,
    name,
    value,
    onChange,
    show,
    onToggle,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                {label}
            </label>

            <div className="relative">
                <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    autoComplete={
                        name === "currentPassword"
                            ? "current-password"
                            : "new-password"
                    }
                    required
                    minLength={
                        name === "currentPassword" ? undefined : 10
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

export default function Settings() {
    const { user } = useSelector((state) => state.auth);

    const [openSideBar, setOpenSideBar] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    const [admin, setAdmin] = useState(null);
    const [profile, setProfile] = useState(initialProfile);
    const [password, setPassword] = useState(initialPassword);

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [showPasswords, setShowPasswords] = useState({});
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchAdmin = async () => {
            try {
                setLoading(true);

                const res = await axios.get(`${API}/api/auth/admin/settings`,
                    {
                        withCredentials: true,
                        signal: controller.signal,
                    }
                );

                const data = res.data.data;

                setAdmin(data);

                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    otherEmail: data.otherEmail || "",
                    otherPhone: data.otherPhone || "",
                    profileImage: data.profileImage || "",
                });
            } catch (error) {
                if (axios.isCancel(error)) return;

                setMessage({
                    type: "error",
                    text:
                        error.response?.data?.message ||
                        "Failed to load admin settings",
                });
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchAdmin();

        return () => controller.abort();
    }, []);

    const notify = (type, text) => {
        setMessage({ type, text });
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPassword((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePassword = (name) => {
        setShowPasswords((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const cancelEdit = () => {
        setProfile({
            name: admin?.name || "",
            email: admin?.email || "",
            phone: admin?.phone || "",
            otherEmail: admin?.otherEmail || "",
            otherPhone: admin?.otherPhone || "",
            profileImage: admin?.profileImage || "",
        });

        setEditing(false);
        setMessage(null);
    };

    const saveProfile = async (e) => {
        e.preventDefault();

        try {
            setSavingProfile(true);
            setMessage(null);

            const res = await axios.put(`${API}/api/auth/admin/profile`,
                profile,
                { withCredentials: true }
            );

            const updated = res.data.data;

            setAdmin(updated);
            setProfile({
                name: updated.name || "",
                email: updated.email || "",
                phone: updated.phone || "",
                otherEmail: updated.otherEmail || "",
                otherPhone: updated.otherPhone || "",
                profileImage: updated.profileImage || "",
            });

            setEditing(false);

            notify("success", "Profile updated successfully");
        } catch (error) {
            notify(
                "error",
                error.response?.data?.message ||
                "Failed to update profile"
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();

        if (password.newPassword !== password.confirmPassword) {
            return notify(
                "error",
                "New password and confirm password do not match"
            );
        }

        const byteLength = new TextEncoder().encode(
            password.newPassword
        ).length;

        if (
            password.newPassword.length < 10 ||
            byteLength > 72
        ) {
            return notify(
                "error",
                "Password must be at least 10 characters and at most 72 UTF-8 bytes"
            );
        }

        if (password.currentPassword === password.newPassword) {
            return notify(
                "error",
                "New password must be different from current password"
            );
        }

        try {
            setSavingPassword(true);
            setMessage(null);

            const res = await axios.put(`${API}/api/auth/admin/change-password`,
                {
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword,
                },
                { withCredentials: true }
            );

            setPassword(initialPassword);
            setShowPasswords({});

            notify(
                "success",
                res.data.message || "Password changed successfully"
            );
        } catch (error) {
            notify(
                "error",
                error.response?.data?.message ||
                "Failed to change password"
            );
        } finally {
            setSavingPassword(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setMessage(null);
        setEditing(false);

        if (tab === "password") {
            setPassword(initialPassword);
            setShowPasswords({});
        }

        if (admin) {
            setProfile({
                name: admin.name || "",
                email: admin.email || "",
                phone: admin.phone || "",
                otherEmail: admin.otherEmail || "",
                otherPhone: admin.otherPhone || "",
                profileImage: admin.profileImage || "",
            });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F5F7FB]">
            <SideBar
                open={openSideBar}
                setOpen={setOpenSideBar}
            />

            <div className="min-w-0 flex-1">
                <Header
                    user={user}
                    name="All Settings"
                    openSideBar={openSideBar}
                    setOpenSideBar={setOpenSideBar}
                />

                <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-7">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                            Account Settings
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your administrator profile and account security.
                        </p>
                    </div>

                    {message && (
                        <div
                            role={message.type === "error" ? "alert" : "status"}
                            className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${message.type === "success"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                                }`}
                        >
                            {message.type === "success" ? (
                                <CheckCircle2 size={19} />
                            ) : (
                                <AlertCircle size={19} />
                            )}

                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <Loader2
                                size={38}
                                className="animate-spin text-blue-600"
                            />
                        </div>
                    ) : !admin ? (
                        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
                            Unable to load administrator information.
                        </div>
                    ) : (
                        <>
                            {/* ADMIN PROFILE CARD */}
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                                <div className="px-6 py-6 md:px-8">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-md">
                                            {admin.profileImage ? (
                                                <img
                                                    src={admin.profileImage}
                                                    alt={admin.name || "Admin"}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserRound
                                                    size={38}
                                                    className="text-blue-600"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 pb-1">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {admin.name || "Administrator"}
                                            </h2>

                                            <p className="mt-1 break-all text-sm text-gray-500">
                                                {admin.email}
                                            </p>

                                            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                <ShieldCheck size={14} />
                                                Administrator
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SETTINGS CONTENT */}
                            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                                {/* SETTINGS NAVIGATION */}
                                <div className="h-fit rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                                    {[
                                        {
                                            id: "profile",
                                            label: "Profile Information",
                                            icon: UserCog,
                                        },
                                        {
                                            id: "password",
                                            label: "Change Password",
                                            icon: LockKeyhole,
                                        },
                                        {
                                            id: "account",
                                            label: "Account Details",
                                            icon: ShieldCheck,
                                        },
                                    ].map((tab) => {
                                        const Icon = tab.icon;

                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => switchTab(tab.id)}
                                                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === tab.id
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* RIGHT CONTENT */}
                                <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-8">
                                    {activeTab === "profile" && (
                                        <form onSubmit={saveProfile}>
                                            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        Personal Information
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Update your administrator details.
                                                    </p>
                                                </div>

                                                {!editing ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditing(true)}
                                                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        <Pencil size={16} />
                                                        Edit Profile
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            disabled={savingProfile}
                                                            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600"
                                                        >
                                                            <X size={16} />
                                                            Cancel
                                                        </button>

                                                        <button
                                                            type="submit"
                                                            disabled={savingProfile}
                                                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                                                        >
                                                            {savingProfile ? (
                                                                <Loader2
                                                                    size={16}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Save size={16} />
                                                            )}
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                {profileFields.map((field) => (
                                                    <ProfileField
                                                        key={field.name}
                                                        field={field}
                                                        value={profile[field.name]}
                                                        editing={editing}
                                                        onChange={handleProfileChange}
                                                    />
                                                ))}
                                            </div>
                                        </form>
                                    )}

                                    {activeTab === "password" && (
                                        <div className="max-w-xl">
                                            <div className="mb-7 flex items-center gap-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                    <KeyRound size={26} />
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        Change Password
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Keep your administrator account secure.
                                                    </p>
                                                </div>
                                            </div>

                                            <form
                                                onSubmit={savePassword}
                                                className="space-y-5"
                                            >
                                                {[
                                                    {
                                                        name: "currentPassword",
                                                        label: "Current Password",
                                                    },
                                                    {
                                                        name: "newPassword",
                                                        label: "New Password",
                                                    },
                                                    {
                                                        name: "confirmPassword",
                                                        label: "Confirm New Password",
                                                    },
                                                ].map((field) => (
                                                    <PasswordInput
                                                        key={field.name}
                                                        {...field}
                                                        value={password[field.name]}
                                                        onChange={handlePasswordChange}
                                                        show={!!showPasswords[field.name]}
                                                        onToggle={() =>
                                                            togglePassword(field.name)
                                                        }
                                                    />
                                                ))}

                                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                                                    Use a unique password of at least 10 characters.
                                                    You must enter your current password to authorize
                                                    the change.
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={savingPassword}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                                >
                                                    {savingPassword ? (
                                                        <Loader2
                                                            size={18}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <ShieldCheck size={18} />
                                                    )}
                                                    Update Password
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {activeTab === "account" && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Account Information
                                            </h3>

                                            <p className="mb-7 mt-1 text-sm text-gray-500">
                                                Administrator account details and status.
                                            </p>

                                            <div className="grid gap-5 md:grid-cols-2">
                                                {[
                                                    {
                                                        label: "Account Role",
                                                        value: admin.role,
                                                        icon: ShieldCheck,
                                                    },
                                                    {
                                                        label: "Account ID",
                                                        value: admin._id,
                                                        icon: UserRound,
                                                    },
                                                    {
                                                        label: "Account Created",
                                                        value: formatDate(admin.createdAt),
                                                        icon: CalendarDays,
                                                    },
                                                    {
                                                        label: "Last Updated",
                                                        value: formatDate(admin.updatedAt),
                                                        icon: Clock3,
                                                    },
                                                ].map((item) => {
                                                    const Icon = item.icon;

                                                    return (
                                                        <div
                                                            key={item.label}
                                                            className="rounded-xl border border-gray-100 bg-gray-50 p-5"
                                                        >
                                                            <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                                                                <Icon size={17} />
                                                                {item.label}
                                                            </div>

                                                            <p className="break-all text-sm font-semibold text-gray-900">
                                                                {item.value || "-"}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
