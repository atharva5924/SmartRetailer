// import { useState, useCallback } from "react";

// export const useFilters = () => {
//   const [filters, setFilters] = useState({});

//   const updateFilter = useCallback((key, value) => {
//     setFilters((prev) => {
//       if (Array.isArray(value) && value.length === 0) {
//         const newFilters = { ...prev };
//         delete newFilters[key];
//         return newFilters;
//       }
//       return { ...prev, [key]: value };
//     });
//   }, []);

//   const clearFilters = useCallback(() => {
//     setFilters({});
//   }, []);

//   return { filters, updateFilter, clearFilters };
// };
