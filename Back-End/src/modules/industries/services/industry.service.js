import Industry from "../models/industry.model.js";
import Category from "../../categories/models/category.model.js";

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