import ProductMedia from "../models/productMedia.model.js";

export const updateProductMediaAltService = async (mediaId, altName) => {
  const media = await ProductMedia.findByIdAndUpdate(
    mediaId, { altName, }, { new: true, }
  );

  return media;
};