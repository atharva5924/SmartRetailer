# System Architecture

## Overview

The Sales Management System is built on a three-layer MERN (MongoDB, Express, React, Node.js) architecture with clear separation between frontend (React), backend (Express), and data layer (MongoDB). The system implements advanced filtering, searching, sorting, and pagination to handle large datasets efficiently.

---

## Backend Architecture

### Server Setup (`server.js`)

- **Framework**: Express.js on Node.js
- **Port**: 5000 (configurable via `.env`)
- **MongoDB Connection**: Mongoose ORM to connect to MongoDB Atlas
- **CORS Enabled**: Allows requests from frontend (http://localhost:5173)
- **Entry Point**: `server.js` initializes Express app, connects to MongoDB, and starts listening for requests

### Route Layer (`sales.routes.js`)

```
GET /api/sales → getSales (fetch paginated, filtered, sorted sales)
GET /api/filter-options → getFilterOptions (fetch unique filter values with caching)
```

Routes are mounted at `/api/sales` prefix and delegate to controllers.

### Controller Layer (`sales.controllers.js`)

**Key Functions:**

1. **`getSales(req, res)`**

   - Receives: `search`, `filters` (JSON), `sort`, `page`, `limit`
   - Builds MongoDB query using `buildFilterQuery()`
   - Applies search regex, sorting, pagination
   - Returns: `data[]`, `stats`, `pagination` metadata
   - Stats include `totalQuantity`, `totalAmount`, `totalDiscount` for current page only

2. **`buildFilterQuery(filters)`**

   - Converts frontend filter object to MongoDB query operators
   - Handles:
     - **region, gender, category, paymentMethod**: `$in` array matching
     - **ageRange**: `$gte` and `$lte` range matching
     - **tags**: Comma-separated string matching with regex word boundaries
     - **dateRange**: String-based YYYY-MM-DD range comparison
   - Returns combined query object

3. **`getFilterOptions(req, res)`**
   - Fetches distinct values from each field
   - Caches results for 5 minutes (TTL: 5 _ 60 _ 1000 ms)
   - Splits comma-separated tags into individual options
   - Returns: `regions[]`, `genders[]`, `categories[]`, `paymentMethods[]`, `tags[]`

### Data Model (`sale.module.js`)

**Schema Fields:**

- `transactionId` (String, unique, indexed)
- `date` (String, format: DD-MM-YYYY, indexed)
- `customerId` (String)
- `customerName` (String, indexed for search)
- `phoneNumber` (String, indexed for search)
- `gender` (String)
- `age` (Number)
- `customerRegion` (String, indexed)
- `productCategory` (String, indexed)
- `productId` (String)
- `quantity` (Number)
- `totalAmount` (Decimal)
- `finalAmount` (Decimal)
- `paymentMethod` (String, indexed)
- `employeeName` (String)
- `tags` (String, comma-separated, indexed)

**Indexes:** transactionId (unique), date, customerName, phoneNumber, customerId, customerRegion, productCategory, paymentMethod, tags

---

## Frontend Architecture

### App Root (`App.jsx`)

- Wraps application with providers (Sidebar, routing context)
- Renders main index page

### Main Page (`Index.jsx`)

**State Management:**

- `searchQuery` – user's search input
- `filters` – object with region, gender, ageRange, category, tags, paymentMethod, dateRange, sortBy
- `debouncedFilters` – debounced version of filters (500ms delay)
- `currentPage` – pagination page number
- `tableData` – array of sale records for current page
- `metrics` – stats object (totalQuantity, totalAmount, totalDiscount)
- `totalPages` – total pages available
- `loading` – boolean for loading state
- `error` – error message string
- `filterOptions` – array of filter configuration objects

**Key Hooks:**

- `useEffect` – debounce filters (500ms) to avoid excessive API calls
- `useEffect` – fetch filter options on mount
- `useEffect` – fetch sales data when filters, search, or page changes
- `useCallback` – memoized handlers for filter change, reset, pagination

**Data Flow:**

1. User types search or changes filter → state updates
2. Debounce effect waits 500ms → calls `setDebouncedFilters()`
3. Main fetch effect triggers when `debouncedFilters`, `searchQuery`, or `currentPage` changes
4. `fetchSales()` API call with payload
5. Response updates `tableData`, `metrics`, `totalPages`
6. UI re-renders with new data

### Filter Components (`FilterBar.jsx`, `DateDropdown.jsx`, `RangeDropdown.jsx`)

**FilterBar.jsx:**

- Maps over `filterOptions` array
- Renders dropdown selects for region, gender, category, tags, payment method
- Renders `RangeDropdown` and `DateDropdown` for age and date
- Each filter calls `onFilterChange(key, value)` callback
- Close-outside-click handling with `useRef` and `useEffect`

**DateDropdown.jsx:**

- Two date inputs (start, end)
- Passes object `{ start: "YYYY-MM-DD", end: "YYYY-MM-DD" }` to parent
- Click-outside closes dropdown

**RangeDropdown.jsx:**

- Two range sliders (min, max)
- Passes object `{ min: number, max: number }` to parent

### Table Component (`SalesTable.jsx`)

- Displays paginated sales data in a grid table
- Columns: Transaction ID, Date, Customer ID, Customer Name, Phone, Gender, Age, Product Category, Quantity
- Copy-to-clipboard for phone numbers
- Skeleton loading state during data fetch
- "No sales data found" message when empty

### Shared Utilities

**`api.js`**

- Base Axios instance with default URL (`http://localhost:5000`)
- `fetchSales(params)` – POST/GET `/api/sales` with filter payload
- `fetchFilterOptions()` – GET `/api/filter-options`

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                           USER INTERACTION                  │
├─────────────────────────────────────────────────────────────┤
│ SearchBar | FilterBar (region, gender, category, etc.)      │
│ DateDropdown | RangeDropdown | SortBy dropdown              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────┐
│     Index.jsx State Updates  │
│     filters, searchQuery, page │
└──────────────────┬───────────┘
                       │
                (500ms debounce)
                       │
                       ▼
┌──────────────────────────────┐
│      fetchSales() API Call   │
│        api.js → Axios POST   │
└──────────────────┬───────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Backend Express Server            │
│   sales.routes.js → sales.controllers.js      │
└──────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         buildFilterQuery(filters)             │
│ - region/gender/category → $in               │
│ - ageRange → $gte/$lte                       │
│ - dateRange → string range comparison        │
│ - tags → regex word boundaries               │
└──────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│          Mongoose Query Execution            │
│        Sale.find(query)                      │
│        .sort(sortObj)                        │
│        .skip((page-1)*limit)                 │
│        .limit(limit)                         │
└──────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              MongoDB Collection              │
│         Returns matching documents           │
└──────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               Response Object                │
│ {                                            │
│   data: [sales...],                          │
│   stats: {totalQuantity, ...},               │
│   pagination: {total, pages, ...}            │
│ }                                            │
└──────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│          Frontend State Update               │
│ setTableData, setMetrics, setTotalPages      │
└──────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                   UI Renders                 │
│ SalesTable, MetricCards, Pagination          │
└──────────────────────────────────────────────┘
```

---

## Folder Structure

```
project-root/
├── client/ # React Frontend
│ ├── src/
│ │ ├── pages/
│ │ │ └── Index.jsx # Main page (state, data fetching)
│ │ ├── components/
│ │ │ ├── App.jsx # App root wrapper
│ │ │ ├── Sidebar.jsx # Sidebar layout
│ │ │ ├── SearchBar.jsx # Search input
│ │ │ ├── FilterBar.jsx # Filter dropdowns and controls
│ │ │ ├── DateDropdown.jsx # Date range picker
│ │ │ ├── RangeDropdown.jsx # Age range slider
│ │ │ ├── SalesTable.jsx # Data table display
│ │ │ ├── MetricCards.jsx # KPI cards (units, amount, discount)
│ │ │ └── Pagination.jsx # Page navigation
│ │ ├── services/
│ │ │ └── api.js # Axios instance, API functions
│ │ ├── libs/
│ │ │ └── utils.js # cn() helper (clsx + twMerge)
│ │ ├── index.css # Global styles, design tokens
│ │ └── main.jsx # React entry point
│ └── package.json
│
├── server/ # Node.js/Express Backend
│ ├── src/
│ │ ├── server.js # Express setup, MongoDB connection
│ │ ├── routes/
│ │ │ └── sales.routes.js # GET /api/sales, /api/filter-options
│ │ ├── controllers/
│ │ │ └── sales.controllers.js # getSales, getFilterOptions logic
│ │ └── models/
│ │ └── sale.module.js # Mongoose schema, Sale model
│ ├── .env # MONGODB_URI, PORT
│ └── package.json
│
└── docs/
├── README.md # Project overview, setup
└── architecture.md # This file
```

---

## Module Responsibilities

### `Index.jsx` (Page Container)

- **Responsibility**: State orchestration, API calls, filter/search coordination
- **Handles**:
  - Filter state (region, gender, category, etc.)
  - Debouncing (500ms) for efficiency
  - Data fetching and error handling
  - Pass state and callbacks to child components

### `FilterBar.jsx` (Filter Coordinator)

- **Responsibility**: Render all filter UI controls
- **Handles**:
  - Dropdown selects (region, gender, etc.)
  - Integration with DateDropdown and RangeDropdown
  - Click-outside closing logic

### `DateDropdown.jsx` & `RangeDropdown.jsx` (Specialized Filters)

- **Responsibility**: Date and numeric range input
- **Handles**: User interactions, value parsing, state updates

### `SalesTable.jsx` (Data Display)

- **Responsibility**: Render paginated sales records
- **Handles**: Column layout, loading skeletons, empty states, copy-to-clipboard

### `api.js` (API Bridge)

- **Responsibility**: HTTP communication layer
- **Handles**: Axios configuration, endpoint definitions, request/response formatting

### `sales.controllers.js` (Business Logic)

- **Responsibility**: Query building, filtering, sorting, pagination logic
- **Handles**:
  - Filter parsing and Mongo query construction
  - Sorting and pagination calculations
  - Stats computation

### `sale.module.js` (Data Model)

- **Responsibility**: MongoDB schema definition and indexing
- **Handles**: Field validation, index creation for query optimization

### `server.js` (Backend Entry)

- **Responsibility**: Server initialization and middleware setup
- **Handles**: Express app creation, MongoDB connection, CORS, route mounting

---

## Performance Optimizations

1. **Debounced Filters** (500ms): Prevents excessive API calls while user is still typing/selecting
2. **Filter Options Caching** (5-minute TTL): Avoids repeated database queries for static filter values
3. **Lean Queries**: `.lean()` used in Mongoose for faster read-only queries
4. **Indexed Fields**: All filter fields (`date`, `customerName`, `customerRegion`, etc.) are indexed for fast lookups
5. **Pagination**: Only fetches 15 records per page instead of entire dataset
6. **Stats on Current Page**: Metrics calculated only for visible rows, not entire dataset

---

## Error Handling

- **Frontend**: Try-catch blocks in `useEffect` data fetch; sets `error` state and displays error message in UI
- **Backend**: Controller try-catch blocks return 500 status with error message JSON
- **Network**: Axios handles failed requests; frontend displays user-friendly error message
