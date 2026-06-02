import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import industryRoutes from "./modules/industries/routes/industry.route.js";
import categoryRoutes from "./modules/categories/routes/category.route.js";
import searchRoutes from "./modules/search/routes/search.route.js";
import connectDB from "./config/db.js";

await connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inquiry Bazaar API is Running",
  });
});

app.use("/api/industries", industryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);

export default app;