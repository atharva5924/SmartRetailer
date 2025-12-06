import Sale from "../models/sale.module.js";

const buildFilterQuery = (filters) => {
  const query = {};

  if (filters.region) {
    query.customerRegion = {
      $in: Array.isArray(filters.region) ? filters.region : [filters.region],
    };
  }

  if (filters.gender) {
    query.gender = {
      $in: Array.isArray(filters.gender) ? filters.gender : [filters.gender],
    };
  }

  if (filters.category) {
    query.productCategory = {
      $in: Array.isArray(filters.category)
        ? filters.category
        : [filters.category],
    };
  }

  if (filters.paymentMethod) {
    query.paymentMethod = {
      $in: Array.isArray(filters.paymentMethod)
        ? filters.paymentMethod
        : [filters.paymentMethod],
    };
  }

  if (filters.tags) {
    query.tags = {
      $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags],
    };
  }

  if (filters.ageRange) {
    const [min, max] = filters.ageRange.split("-").map(Number);
    query.age = { $gte: min, $lte: max };
  }

  if (filters.dateRange) {
    const [startDate, endDate] = filters.dateRange;
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return query;
};

const getSales = async (req, res) => {
  try {
    const {
      search,
      filters = {},
      sort = "date",
      page = 1,
      limit = 10,
    } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = parseInt(limit) || 10;

    let query = buildFilterQuery(JSON.parse(filters || "{}"));

    if (search) {
      const searchRegex = {
        $or: [
          { customerName: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
      };
      query = { ...query, ...searchRegex };
    }

    // Sorting
    let sortObj = {};
    switch (sort) {
      case "date":
        sortObj = { date: -1 }; // Newest first
        break;
      case "quantity":
        sortObj = { quantity: -1 };
        break;
      case "customerName":
        sortObj = { customerName: 1 };
        break;
      default:
        sortObj = { date: -1 };
    }

    // Execute query
    const total = await Sale.countDocuments(query);
    const data = await Sale.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        pages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get filter options (unique values)
const getFilterOptions = async (req, res) => {
  try {
    const regions = await Sale.distinct("customerRegion");
    const genders = await Sale.distinct("gender");
    const categories = await Sale.distinct("productCategory");
    const paymentMethods = await Sale.distinct("paymentMethod");
    const tags = await Sale.distinct("tags");

    res.json({
      regions,
      genders,
      categories,
      paymentMethods,
      tags,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getSales, getFilterOptions };
