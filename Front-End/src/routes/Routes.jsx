import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Category from "../pages/Category/Category";
import ProtectedRoute from "./ProtectedRoute";

export default function AllRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-category" element={<Category />} />
            </Route>
        </Routes>
    );
}