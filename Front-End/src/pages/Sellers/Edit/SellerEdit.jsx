
import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import SideBar from "../../../components/SideBar";
import Header from "../../../components/Header";
import PaymentSection from "../../../components/Sellers/PaymentSection";
import ServiceSection from "../../../components/Sellers/ServiceSection";
import EmployeeSection from "../../../components/Sellers/EmployeeSection";

import {
  User,
  Users,
  Building2,
  CreditCard,
  MapPin,
  UserRound,
  LockKeyhole,
  Pencil,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API = import.meta.env.VITE_BACKEND_URL;

const personalFields = [
  { name: "name", label: "Full Name", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "phone", label: "Phone Number", type: "tel" },
  { name: "otherEmail", label: "Alternate Email", type: "email" },
  { name: "otherPhone", label: "Alternate Phone", type: "tel" },
  { name: "profileImage", label: "Profile Image URL", type: "url" },
];

const businessFields = [
  { name: "companyName", label: "Company Name" },
  { name: "ceoName", label: "CEO Name" },
  { name: "gstNumber", label: "GST Number" },
  { name: "businessField", label: "Business Field" },
  { name: "annualTurnover", label: "Annual Turnover" },
  { name: "numberOfEmployees", label: "Number of Employees" },
  { name: "city", label: "City", required: true },
  { name: "state", label: "State" },
  { name: "address", label: "Full Address", full: true },
  { name: "establishedDate", label: "Established Date", type: "date" },
];

const socialFields = [
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "telegram",
  "whatsapp",
  "twitter",
];

const businessTypes = [
  "Manufacturer",
  "Trader",
  "Service Provider",
  "Wholesaler",
  "Retailer",
  "Other",
];

const ownershipTypes = [
  "Proprietorship",
  "Partnership",
  "Pvt Ltd",
  "LLP",
  "Other",
];

const tabs = [
  { id: "personal", label: "Personal", icon: User },
  { id: "business", label: "Business", icon: Building2 },
  { id: "password", label: "Password", icon: LockKeyhole },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "service", label: "Service Locations", icon: MapPin },
  { id: "asignEmployee", label: "Assign Employee", icon: Users },
];

const initialPassword = {
  newPassword: "",
  confirmPassword: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
};

const normalizeData = (data) => ({
  name: data?.name || "",
  email: data?.email || "",
  phone: data?.phone || "",
  otherEmail: data?.otherEmail || "",
  otherPhone: data?.otherPhone || "",
  profileImage: data?.profileImage || "",
  business: {
    companyName: data?.business?.companyName || "",
    ceoName: data?.business?.ceoName || "",
    gstNumber: data?.business?.gstNumber || "",
    businessType: data?.business?.businessType || "",
    ownershipType: data?.business?.ownershipType || "",
    businessField: data?.business?.businessField || "",
    annualTurnover: data?.business?.annualTurnover || "",
    numberOfEmployees: data?.business?.numberOfEmployees || "",
    city: data?.business?.city || "",
    state: data?.business?.state || "",
    address: data?.business?.address || "",
    establishedDate: toDateInput(
      data?.business?.establishedDate
    ),
    social: Object.fromEntries(
      socialFields.map((key) => [
        key,
        data?.business?.social?.[key] || "",
      ])
    ),
  },
});

const Field = ({
  label,
  name,
  value,
  onChange,
  editing,
  type = "text",
  required = false,
  full = false,
}) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </label>

    {editing ? (
      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    ) : (
      <div className="min-h-12 break-words rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
        {value || "-"}
      </div>
    )}
  </div>
);

export default function SellerEdit() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [supplierData, setSupplierData] = useState(null);
  const [form, setForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState(initialPassword);

  const [openSideBar, setOpenSideBar] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/supplier/${id}`, { withCredentials: true });

      setSupplierData(res.data.data);
      setForm(normalizeData(res.data.data));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load supplier details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const notify = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess("");
    } else {
      setSuccess(message);
      setError("");
    }
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    setEditing(false);
    setError("");
    setSuccess("");
    setPasswordForm(initialPassword);

    if (supplierData) {
      setForm(normalizeData(supplierData));
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        [name]: value,
      },
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        social: {
          ...prev.business.social,
          [name]: value,
        },
      },
    }));
  };

  const cancelEdit = () => {
    setForm(normalizeData(supplierData));
    setEditing(false);
    setError("");
  };

  const saveDetails = async (e) => {
    e.preventDefault();

    const payload = activeTab === "personal"
      ? Object.fromEntries(personalFields.map(({ name }) => [name, form[name],]))
      : { business: form.business, };

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const res = await axios.put(`${API}/api/supplier/${id}`, payload, { withCredentials: true });
      const updated = res.data.data;

      setSupplierData(updated);
      setForm(normalizeData(updated));
      setEditing(false);

      notify("Supplier details updated successfully");
    } catch (err) {
      notify(
        err.response?.data?.message ||
        "Failed to update supplier",
        true
      );
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = passwordForm;
    if (newPassword !== confirmPassword) {
      return notify("Passwords do not match", true);
    }

    const bytes = new TextEncoder().encode(newPassword).length;

    if (newPassword.length < 10 || bytes > 72) {
      return notify(
        "Password must be at least 10 characters and at most 72 UTF-8 bytes",
        true
      );
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await axios.put(`${API}/api/supplier/${id}`, { newPassword }, { withCredentials: true });

      setPasswordForm(initialPassword);
      setShowPassword(false);

      notify("Supplier password updated successfully");
    } catch (err) {
      notify(
        err.response?.data?.message ||
        "Failed to update password",
        true
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!supplierData || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            {error || "Supplier not found"}
          </p>
          <button
            onClick={fetchData}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FB]">
      <SideBar
        open={openSideBar}
        setOpen={setOpenSideBar}
      />

      <div className="min-w-0 flex-1">
        <Header
          user={user}
          name={supplierData.name || "Supplier"}
          openSideBar={openSideBar}
          setOpenSideBar={setOpenSideBar}
        />

        <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-7">
          {/* PROFILE HEADER */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="px-5 py-6 md:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-md">
                  {supplierData.profileImage ? (
                    <img
                      src={supplierData.profileImage}
                      alt={supplierData.name}
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
                  <h1 className="break-words text-2xl font-bold text-gray-900">
                    {supplierData.name}
                  </h1>

                  <p className="break-words text-sm text-gray-500">
                    {supplierData.email}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                      {supplierData.role}
                    </span>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      <ShieldCheck
                        size={12}
                        className="mr-1 inline"
                      />
                      Supplier Account
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarDays size={15} />
                  Joined{" "}
                  {supplierData.createdAt
                    ? new Date(
                      supplierData.createdAt
                    ).toLocaleDateString("en-IN")
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          {success && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              <CheckCircle2 size={19} />
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {/* MAIN CARD */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* TABS */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 pt-3 md:px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTab(tab.id)}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition ${selected
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    <Icon size={17} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-5 md:p-8">
              {/* PERSONAL & BUSINESS */}
              {["personal", "business"].includes(activeTab) && (
                <form onSubmit={saveDetails}>
                  <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {activeTab === "personal"
                          ? "Personal Information"
                          : "Business Information"}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {editing
                          ? "Update the fields and save your changes."
                          : "View and manage supplier information."}
                      </p>
                    </div>

                    {!editing ? (
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Pencil size={16} />
                        Edit Details
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600"
                        >
                          <X size={16} />
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {saving ? (
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

                  {/* PERSONAL FIELDS */}
                  {activeTab === "personal" && (
                    <div className="grid gap-5 md:grid-cols-2">
                      {personalFields.map((field) => (
                        <Field
                          key={field.name}
                          {...field}
                          value={form[field.name]}
                          onChange={handlePersonalChange}
                          editing={editing}
                        />
                      ))}

                      <Field
                        label="Account Role"
                        value={supplierData.role}
                        editing={false}
                      />
                    </div>
                  )}

                  {/* BUSINESS FIELDS */}
                  {activeTab === "business" && (
                    <div className="space-y-8">
                      <div className="grid gap-5 md:grid-cols-2">
                        {businessFields
                          .slice(0, 3)
                          .map((field) => (
                            <Field
                              key={field.name}
                              {...field}
                              value={form.business[field.name]}
                              onChange={handleBusinessChange}
                              editing={editing}
                            />
                          ))}

                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                            Business Type
                          </label>

                          {editing ? (
                            <select
                              name="businessType"
                              value={form.business.businessType}
                              onChange={handleBusinessChange}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            >
                              <option value="">Select Type</option>
                              {businessTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <DisplayValue
                              value={form.business.businessType}
                            />
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                            Ownership Type
                          </label>

                          {editing ? (
                            <select
                              name="ownershipType"
                              value={form.business.ownershipType}
                              onChange={handleBusinessChange}
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                            >
                              <option value="">Select Ownership</option>
                              {ownershipTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <DisplayValue
                              value={form.business.ownershipType}
                            />
                          )}
                        </div>

                        {businessFields
                          .slice(3)
                          .map((field) => (
                            <Field
                              key={field.name}
                              {...field}
                              value={form.business[field.name]}
                              onChange={handleBusinessChange}
                              editing={editing}
                            />
                          ))}
                      </div>

                      {/* SOCIAL LINKS */}
                      <div className="border-t border-gray-100 pt-7">
                        <h3 className="mb-5 text-lg font-bold text-gray-900">
                          Social Media Links
                        </h3>

                        <div className="grid gap-5 md:grid-cols-2">
                          {socialFields.map((name) => (
                            <Field
                              key={name}
                              label={
                                name.charAt(0).toUpperCase() +
                                name.slice(1)
                              }
                              name={name}
                              type="url"
                              value={form.business.social[name]}
                              onChange={handleSocialChange}
                              editing={editing}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* CHANGE PASSWORD */}
              {activeTab === "password" && (
                <div className="mx-auto max-w-xl">
                  <div className="mb-7 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <LockKeyhole size={26} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Change Supplier Password
                      </h2>
                      <p className="text-sm text-gray-500">
                        Set a new password for this supplier.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={changePassword}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        New Password
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          minLength={10}
                          autoComplete="new-password"
                          required
                          placeholder="Enter new password"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Confirm New Password
                      </label>

                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        autoComplete="new-password"
                        required
                        placeholder="Confirm new password"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                      The supplier's existing password will be replaced.
                      Use a strong, unique password of at least 10 characters.
                      The current password is not required for this admin action.
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? (
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

              {/* EXISTING SECTIONS */}
              {activeTab === "payment" && (
                <PaymentSection
                  InfoItem={InfoItem}
                  id={supplierData._id}
                />
              )}

              {activeTab === "service" && (
                <ServiceSection
                  supplierData={supplierData}
                  fetchData={fetchData}
                  id={id}
                />
              )}

              {activeTab === "asignEmployee" && (
                <EmployeeSection
                  supplierData={supplierData}
                  fetchData={fetchData}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const DisplayValue = ({ value }) => (
  <div className="min-h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
    {value || "-"}
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
      {icon}
      {label}
    </div>

    <p className="break-words font-semibold text-gray-800">
      {value || "-"}
    </p>
  </div>
);
