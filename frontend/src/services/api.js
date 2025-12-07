import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const fetchSales = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/sales`, {
      params: {
        search: params.search,
        filters: JSON.stringify(params.filters),
        sort: params.sort,
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error;
  }
};

export const fetchFilterOptions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/filter-options`);
    return response.data;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    throw error;
  }
};
