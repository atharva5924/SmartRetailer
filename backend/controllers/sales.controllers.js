import Sale from "../models/Sale.module.js";

let filterCache = null;
let filterCacheTimestamp = 0;
const FILTER_CACHE_TTL_MS = 5 * 60 * 1000;

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
    const tagRegexes = filters.tags.map(
      (tag) => new RegExp(`\\b${tag}\\b`, "i") 
    );
    query.tags = { $in: tagRegexes };
  }

  if (filters.ageRange) {
    const [min, max] = filters.ageRange.split("-").map(Number);
    query.age = { $gte: min, $lte: max };
  }

  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDateStr, endDateStr] = filters.dateRange;

    const convertToComparableFormat = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split("-");

      if (parts[0].length === 4) {
        return dateStr; 
      }

      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    };

    const startDB = convertToComparableFormat(startDateStr);
    const endDB = convertToComparableFormat(endDateStr);

    if (startDB && endDB) {

      query.$expr = {
        $and: [
          {
            $gte: [
              {
                $concat: [
                  { $substr: ["$date", 6, 4] }, 
                  "-",
                  { $substr: ["$date", 3, 2] }, 
                  "-",
                  { $substr: ["$date", 0, 2] }, 
                ],
              },
              startDB,
            ],
          },
          {
            $lte: [
              {
                $concat: [
                  { $substr: ["$date", 6, 4] },
                  "-",
                  { $substr: ["$date", 3, 2] },
                  "-",
                  { $substr: ["$date", 0, 2] },
                ],
              },
              endDB,
            ],
          },
        ],
      };
    }
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

    if (search) {
      const searchRegex = {
        $or: [
          { customerName: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
      };
      query = { ...query, ...searchRegex };
    }

    let sortObj = {};
    switch (sort) {
      case "date-desc":
        sortObj = { date: -1 }; 
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
      case "quantity-desc":
        sortObj = { quantity: -1 }; 
        break;
      case "quantity-asc":
        sortObj = { quantity: 1 }; 
        break;
      default:
        sortObj = { date: -1 };
    }

    const total = await Sale.countDocuments(query);

    const data = await Sale.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(); 

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
      stats, 
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

const getFilterOptions = async (req, res) => {
  try {
    const now = Date.now();

    if (filterCache && now - filterCacheTimestamp < FILTER_CACHE_TTL_MS) {
      return res.json(filterCache);
    }

    const regions = await Sale.distinct("customerRegion");
    const genders = await Sale.distinct("gender");
    const categories = await Sale.distinct("productCategory");
    const paymentMethods = await Sale.distinct("paymentMethod");

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

    filterCache = payload;
    filterCacheTimestamp = now;

    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getSales, getFilterOptions };
