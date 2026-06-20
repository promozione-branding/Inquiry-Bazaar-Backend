import { updateProductMediaAltService } from "../services/productMedia.service.js";

export const updateProductMediaAlt = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { altName } = req.body;
    // console.log(mediaId)
    if (!altName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Alt text is required",
      });
    }

    const data = await updateProductMediaAltService(mediaId, altName);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alt text updated",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};