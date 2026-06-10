import { getAllBuyersService } from "../services/buyer.service.js";

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