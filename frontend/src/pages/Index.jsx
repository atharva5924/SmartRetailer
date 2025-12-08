import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { SearchBar } from "../components/SearchBar";
import { FilterBar } from "../components/FilterBar";
import { MetricCards } from "../components/MetricCards";
import { SalesTable } from "../components/SalesTable";
import { Pagination } from "../components/Pagination";
import { fetchSales, fetchFilterOptions } from "../services/api";

const initialFilters = {
  region: [],
  gender: [],
  ageRange: { min: 18, max: 75 },
  category: [],
  tags: [],
  paymentMethod: [],
  dateRange: { start: "", end: "" },
  sortBy: "date-desc",
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalQuantity: 0,
    totalAmount: 0,
    totalDiscount: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceTimeoutRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setFiltersLoading(true);
        const data = await fetchFilterOptions();
        const options = [
          {
            id: "region",
            label: "Customer Region",
            options: [...data.regions],
          },
          { id: "gender", label: "Gender", options: [...data.genders] },
          {
            id: "category",
            label: "Product Category",
            options: [...data.categories],
          },
          {
            id: "tags",
            label: "Tags",
            options: [...data.tags],
          },
          {
            id: "paymentMethod",
            label: "Payment Method",
            options: [...data.paymentMethods],
          },
        ];

        setFilterOptions(options);
      } catch (error) {
        console.error("Filter options failed, using static:", error);
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterPayload = {
          region: debouncedFilters.region,
          gender: debouncedFilters.gender,
          ageRange: debouncedFilters.ageRange
            ? `${debouncedFilters.ageRange.min}-${debouncedFilters.ageRange.max}`
            : null,
          category: debouncedFilters.category,
          tags: debouncedFilters.tags,
          paymentMethod: debouncedFilters.paymentMethod,
          dateRange:
            debouncedFilters.dateRange?.start && debouncedFilters.dateRange?.end
              ? [
                  debouncedFilters.dateRange.start,
                  debouncedFilters.dateRange.end,
                ]
              : null,
        };

        const result = await fetchSales({
          search: debouncedSearch  || "",
          filters: filterPayload,
          sort: filters.sortBy || "date-asc",
          page: currentPage,
          limit: 10,
        });

        if (!result?.success) {
          throw new Error(result?.error || "Failed to fetch sales");
        }
        setTableData(result.data || []);
        setMetrics({
          totalQuantity: result.stats?.totalQuantity || 0,
          totalAmount: result.stats?.totalAmount || 0,
          totalDiscount: result.stats?.totalDiscount || 0,
        });
        setTotalPages(result.pagination?.pages || 1);
      } catch (err) {
        console.error("Error loading sales:", err);
        setError(err.message || "Error loading data");
        setTableData([]);
        setMetrics({
          totalQuantity: 0,
          totalAmount: 0,
          totalDiscount: 0,
        });
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [currentPage, debouncedFilters, debouncedSearch]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <header className="flex items-center px-6 py-4 border-b border-border bg-card">
          <h1 className="text-xl font-semibold text-foreground">
            Sales Management System
          </h1>
          <div className="pl-133">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <FilterBar
            filterOptions={filterOptions}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            loading={filtersLoading}
          />

          <MetricCards metrics={metrics} />

          {loading ? (
            <div className="flex items-center justify-center bg-card border border-border rounded-lg p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
                <p className="text-foreground font-medium">
                  Loading sales data...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center bg-card border border-border rounded-lg p-8">
              <div className="flex flex-col items-center gap-4">
                <p className="text-red-500 font-semibold">Error loading data</p>
                <p className="text-foreground/70 text-sm text-center">
                  {error}
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : tableData.length === 0 ? (
            <div className="flex items-center justify-center bg-card border border-border rounded-lg p-8">
              <p className="text-foreground/60">No sales data found</p>
            </div>
          ) : (
            <>
              <SalesTable data={tableData} loading={false} />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
