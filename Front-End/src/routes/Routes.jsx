import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Category from "../pages/Category/Category";
import ProtectedRoute from "./ProtectedRoute";
import Sellers from "../pages/Sellers/Sellers";
import Buyers from "../pages/Buyers/Buyers";
import Inquiry from "../pages/Inquiry/Inquiry";
import Help from "../pages/Help/Help";
import Settings from "../pages/Settings/Settings";
import SellerEdit from "../pages/Sellers/Edit/SellerEdit";
import SellerLeads from "../pages/Sellers/Leads/Leads";
import Reply from "../pages/Help/Reply/Reply";
import AddCategory from "../components/Category/Add/Category";
import AddIndustry from "../components/Category/Add/Industry";
import EditIndustry from "../components/Category/Edit/Industry";
import EditCategory from "../components/Category/Edit/Category";
import SellerImages from "../pages/Sellers/Images/Images";

export default function AllRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />

                {/* Category */}
                <Route path="/all-category" element={<Category />} />
                <Route path="/add-industry" element={<AddIndustry />} />
                <Route path="/edit-industry/:id" element={<EditIndustry />} />
                <Route path="/add-category" element={<AddCategory />} />
                <Route path="/edit-category/:id" element={<EditCategory />} />

                {/* Seller */}
                <Route path="/all-sellers" element={<Sellers />} />
                <Route path="/edit-seller/:id" element={<SellerEdit />} />
                <Route path="/seller-leads/:id" element={<SellerLeads />} />
                <Route path="/seller-image/:id" element={<SellerImages />} />

                {/* Buyer */}
                <Route path="/all-buyers" element={<Buyers />} />

                {/* Inquiry */}
                <Route path="/inquiry" element={<Inquiry />} />

                {/* Help */}
                <Route path="/help" element={<Help />} />
                <Route path="/help-reply/:id" element={<Reply />} />

                <Route path="/settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}