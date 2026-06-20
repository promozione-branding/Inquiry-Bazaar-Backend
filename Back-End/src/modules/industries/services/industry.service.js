import Industry from "../models/industry.model.js";
import Category from "../../categories/models/category.model.js";
import slugify from "slugify";
import { uploadToR2, deleteFromR2 } from "../../../utils/r2Service.js";

export const getAllIndustriesService = async () => {
  const industries = await Industry.find()
    .sort({ name: 1 }).lean();

  return industries;
};

export const getIndustryBySlugService = async (slug) => {
  const industry = await Industry.aggregate([
    { $match: { slug, }, },
    {
      $lookup: {
        from: "categories",
        let: { industryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$industryId", "$$industryId"] },
                  { $eq: ["$parentCategoryId", null] },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "categories",
              let: { categoryId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$parentCategoryId", "$$categoryId"],
                    },
                  },
                },
                {
                  $project: {
                    name: 1,
                    slug: 1,
                    imageUrl: 1,
                  },
                },
              ],
              as: "subCategories",
            },
          },
          {
            $project: {
              name: 1,
              slug: 1,
              imageUrl: 1,
              subCategories: 1,
            },
          },
        ],
        as: "categories",
      },
    },
  ]);

  return industry[0] || null;
};

export const getIndustryTreeService = async () => {
  const industries = await Industry.aggregate([
    {
      $lookup: {
        from: "categories",
        let: { industryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$industryId", "$$industryId"] },
                  { $eq: ["$parentCategoryId", null] }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "categories",
              let: { categoryId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$parentCategoryId", "$$categoryId"]
                    }
                  }
                },
                {
                  $project: {
                    name: 1,
                    slug: 1,
                    imageUrl: 1
                  }
                },
                // {
                //   $sort: { name: 1 } // subcategories A-Z
                // }
              ],
              as: "subCategories"
            }
          },
          {
            $project: {
              name: 1,
              slug: 1,
              imageUrl: 1,
              subCategories: 1
            }
          },
          // {
          //   $sort: { name: 1 } // categories A-Z
          // }
        ],
        as: "categories"
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        imageUrl: 1,
        categories: 1
      }
    },
    {
      $sort: { name: 1 } // industries A-Z
    }
  ]);

  return industries;
};

export const createIndustry = async ({ name, metaTitle, metaDescription, file, imageAlt }) => {
  const slug = slugify(name, { lower: true, strict: true, });
  const exists = await Industry.findOne({ slug, });

  if (exists) {
    throw new Error("Industry already exists");
  }

  let imageUrl = "";
  let imageKey = "";

  if (file) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const uploaded = await uploadToR2({
      file: file.buffer,
      folder: "industries",
      fileName,
      contentType: file.mimetype,
    });

    imageUrl = uploaded.url;
    imageKey = uploaded.key;
  }

  return await Industry.create({
    name,
    slug,
    metaTitle: metaTitle || name,
    metaDescription: metaDescription || `Explore ${name}`,
    imageUrl,
    imageKey,
    imageAlt,
  });
};

export const getIndustryById = async (id) => {
  return await Industry.findById(id);
};

export const updateIndustry = async (id, { name, metaTitle, metaDescription, file, imageAlt }) => {
  const industry = await Industry.findById(id);

  if (!industry) {
    throw new Error("Industry not found");
  }

  let imageUrl = industry.imageUrl;
  let imageKey = industry.imageKey;

  if (file) {
    if (industry.imageKey) {
      await deleteFromR2(industry.imageKey);
    }

    const uploaded = await uploadToR2({
      file: file.buffer,
      folder: "industries",
      fileName: `${Date.now()}-${file.originalname}`,
      contentType: file.mimetype,
    });

    imageUrl = uploaded.url;
    imageKey = uploaded.key;
  }

  industry.name = name || industry.name;
  industry.metaTitle = metaTitle || industry.metaTitle;
  industry.metaDescription = metaDescription || industry.metaDescription;
  industry.imageUrl = imageUrl;
  industry.imageKey = imageKey;
  industry.imageAlt = imageAlt || industry.imageAlt;;

  await industry.save();
  return industry;
};

export const deleteIndustry = async (id) => {
  const industry = await Industry.findById(id);

  if (!industry) {
    throw new Error("Industry not found");
  }

  if (industry.imageKey) {
    await deleteFromR2(industry.imageKey);
  }

  await Industry.findByIdAndDelete(id);

  return true;
};