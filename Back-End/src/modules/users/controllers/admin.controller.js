import { getAllBuyersService, getAllSuppliersService } from "../services/admin.service.js";

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await getAllSuppliersService();

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBuyers = async (req, res) => {
  try {
    const buyers = await getAllBuyersService();

    return res.status(200).json({
      success: true,
      count: buyers.length,
      data: buyers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};