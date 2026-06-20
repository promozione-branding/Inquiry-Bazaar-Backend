import React, { useEffect, useRef, useState, } from "react";
import axios from "axios";
import JoditEditor from "jodit-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";
import SideBar from "../../SideBar";
import { useSelector } from "react-redux";
import { Plus, Upload } from "lucide-react";
import SearchableSelect from "../../Inputs/SearchInput";

export default function AddCategory() {
  const navigate = useNavigate();
  const editor = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries,] = useState([]);
  const [categories, setCategories,] = useState([]);
  const [formData, setFormData,] = useState({
    name: "",
    industryId: "",
    parentCategoryId: "",
    imageAlt: "",
    metaTitle: "",
    metaDescription: "",
    categoryDescription: "",
    image: null,
    faqs: [{ question: "", answer: "", },],
  });

  const [preview, setPreview,] = useState("");

  useEffect(() => {
    fetchIndustries();
    fetchCategories();
  }, []);

  const fetchIndustries = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/industries`);
    setIndustries(res.data.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/main`);
    setCategories(res.data.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFaq = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index][field] = value;
    setFormData({ ...formData, faqs: updated, });
  };

  const addFaq = () => {

    setFormData({
      ...formData,
      faqs: [
        ...formData.faqs,
        { question: "", answer: "", },
      ],
    });
  };

  const removeFaq = (index) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name)
        return toast.error("Name required");

      if (!formData.industryId)
        return toast.error("Select industry");
      setLoading(true);
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("industryId", formData.industryId);
      payload.append("parentCategoryId", formData.parentCategoryId);
      payload.append("imageAlt", formData.imageAlt);
      payload.append("metaTitle", formData.metaTitle);
      payload.append("metaDescription", formData.metaDescription);
      payload.append("categoryDescription", formData.categoryDescription);
      payload.append("faqs",
        JSON.stringify(formData.faqs)
      );
      if (formData.image) {
        payload.append("file", formData.image);
      }
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/categories/add`, payload,
        { withCredentials: true, }
      );

      toast.success("Category Added");
      navigate("/all-category");
    } catch (err) {
      console.log(err.response?.data);
      toast.error(
        err.response?.data?.message || "Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar open={openSideBar} setOpen={setOpenSideBar} />

      <div className="flex-1">
        <Header user={user} name="Add Industry" openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} />

        <main className="p-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-2xl font-bold text-[#0e2347] mb-5 text-center">
              Add Category
            </h2>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name
                </label>
                <input
                  name="name"
                  placeholder="Name"
                  onChange={handleChange}
                  className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
              </div>

              <SearchableSelect
                label="Select Industry"
                name="industryId"
                value={formData.industryId}
                onChange={handleChange}
                options={industries.map((c) => ({
                  label: c.name,
                  value: c._id,
                }))}
              />

              <SearchableSelect
                label="Select Category"
                name="parentCategoryId"
                value={formData.parentCategoryId}
                onChange={handleChange}
                options={categories.map((c) => ({
                  label: c.name,
                  value: c._id,
                }))}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Image
                </label>

                <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-48 h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <>
                      <Upload
                        size={40}
                        className="text-gray-400 mb-3"
                      />

                      <p className="text-gray-500">
                        Click to upload image
                      </p>
                    </>
                  )}

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.files[0], });
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image Alt Text
                </label>

                <input
                  type="text"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleChange}
                  placeholder="Image Alt"
                  className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Title
                </label>
                <input
                  name="metaTitle"
                  placeholder="Meta Title"
                  onChange={handleChange}
                  className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  placeholder="Meta Description"
                  onChange={handleChange}
                  className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Description
                </label>

                <JoditEditor
                  ref={editor}
                  value={formData.categoryDescription}
                  onBlur={(v) => setFormData({ ...formData, categoryDescription: v, })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3>FAQs</h3>
                  <button type="button" onClick={addFaq}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded flex items-center gap-1"
                  >
                    <Plus size={18} /> Add FAQ
                  </button>
                </div>

                {formData.faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-300 shadow-sm p-4 rounded mb-4">
                    <input
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => handleFaq(i, "question", e.target.value)}
                      className="w-full border border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                    />

                    <textarea
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => handleFaq(i, "answer", e.target.value)}
                      className="w-full border mt-4 border-gray-300 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
                    />

                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeFaq(i)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md font-semibold transition">
                  {loading ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );

}