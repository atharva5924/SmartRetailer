import Sale from "../models/Sale.module.js";

let filterCache = null;
let filterCacheTimestamp = 0;
const FILTER_CACHE_TTL_MS = 5 * 60 * 1000;

// Build filter query
const buildFilterQuery = (filters) => {
  const query = {};

  if (filters.region && filters.region.length > 0) {
    query.customerRegion = { $in: filters.region };
  }

  if (filters.gender && filters.gender.length > 0) {
    query.gender = { $in: filters.gender };
  }

  if (filters.category && filters.category.length > 0) {
    query.productCategory = { $in: filters.category };
  }

  if (filters.paymentMethod && filters.paymentMethod.length > 0) {
    query.paymentMethod = { $in: filters.paymentMethod };
  }

  if (filters.tags && filters.tags.length > 0) {
    // Match documents where tags contains ANY of the selected tags
    const tagRegexes = filters.tags.map(
      (tag) => new RegExp(`\\b${tag}\\b`, "i") // Word boundary match
    );
    query.tags = { $in: tagRegexes };
  }
  // Age Range
  if (filters.ageRange) {
    const [min, max] = filters.ageRange.split("-").map(Number);
    query.age = { $gte: min, $lte: max };
  }

  // Date Range
  if (filters.dateRange && filters.dateRange.length === 2) {
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
      filters = "{}",
      sort = "date-asc",
      page = 1,
      limit = 10,
    } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = parseInt(limit) || 10;

    let query = buildFilterQuery(JSON.parse(filters));

    // Search
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
      case "date-desc":
        sortObj = { date: -1 }; // Newest first
        break;
      case "date-asc":
        sortObj = { date: 1 };
        break;
      case "name-asc":
        sortObj = { customerName: 1 };
        break;
      case "name-desc":
        sortObj = { customerName: -1 };
        break;
      default:
        sortObj = { date: -1 };
    }

    // Count total matching documents
    const total = await Sale.countDocuments(query);

    // Fetch current page data
    const data = await Sale.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(); // Use lean() for faster queries

    // Calculate stats ONLY for the 10 rows currently displayed
    const stats = {
      totalQuantity: 0,
      totalAmount: 0,
      totalDiscount: 0,
    };

    data.forEach((row) => {
      stats.totalQuantity += row.quantity || 0;
      stats.totalAmount += row.finalAmount || 0;
      // Calculate discount amount: totalAmount - finalAmount (or discountPercentage * totalAmount / 100)
      const discountAmount = (row.totalAmount || 0) - (row.finalAmount || 0);
      stats.totalDiscount += discountAmount;
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data,
      stats, // NEW: Include stats for current page only
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
// Get filter options (unique values) - UPDATED for comma-separated tags
const getFilterOptions = async (req, res) => {
  try {
    const now = Date.now();

    // 1) If cache is fresh, return it directly
    if (filterCache && now - filterCacheTimestamp < FILTER_CACHE_TTL_MS) {
      return res.json(filterCache);
    }

    // 2) Otherwise compute fresh values
    const regions = await Sale.distinct("customerRegion");
    const genders = await Sale.distinct("gender");
    const categories = await Sale.distinct("productCategory");
    const paymentMethods = await Sale.distinct("paymentMethod");

    // All documents with tags, split comma‑separated
    const docsWithTags = await Sale.find({}, { tags: 1 }).lean();

    const allTagsSet = new Set();
    docsWithTags.forEach((doc) => {
      if (!doc.tags) return;
      doc.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => allTagsSet.add(t));
    });

    const payload = {
      regions: regions.filter(Boolean),
      genders: genders.filter(Boolean),
      categories: categories.filter(Boolean),
      paymentMethods: paymentMethods.filter(Boolean),
      tags: Array.from(allTagsSet).sort(),
    };

    // 3) Save to cache and return
    filterCache = payload;
    filterCacheTimestamp = now;

    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getSales, getFilterOptions };
