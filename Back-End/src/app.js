import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import industryRoutes from "./modules/industries/routes/industry.route.js";
import categoryRoutes from "./modules/categories/routes/category.route.js";
import searchRoutes from "./modules/search/routes/search.route.js";
import productRoutes from "./modules/products/routes/product.route.js";
import userWebpageRoutes from "./modules/users/routes/userWebpage.route.js";
import authRoutes from "./modules/users/routes/userAuth.route.js";
import buyerRoutes from "./modules/users/routes/buyer.route.js";
import supplierRoutes from "./modules/users/routes/supplier.route.js";
import supplierMembershipRoutes from "./modules/users/routes/supplierMembership.route.js";
import connectDB from "./config/db.js";

const app = express();
await connectDB();

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://inquirybazaar.com",
      "https://www.inquirybazaar.com",
      "https://backend.inquirybazaar.com",
      "https://dir.inquirybazaar.com",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Inquiry Bazaar Backend is Running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/supplier/membership", supplierMembershipRoutes);
app.use("/api/industries", industryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/product", productRoutes);
app.use("/api/webpage", userWebpageRoutes);

export default app;