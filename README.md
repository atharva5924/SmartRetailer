# Sales Management System

A full-stack MERN application for managing and analyzing sales transactions with advanced search, filtering, sorting, and pagination capabilities. Built with React, Node.js, MongoDB, and TailwindCSS for a modern, responsive dashboard experience.

**Note:** Due to the 512 MB storage limit of MongoDB Atlas free tier, this project is implemented and tested on a subset of approximately 3,54,000 rows instead of the full 10,00,000-row dataset. The API and all features are designed to scale to the full dataset on a higher tier.

## Tech Stack

**Frontend:**

- React 18 with Hooks
- TailwindCSS + Design System (CSS Variables)
- Lucide React Icons
- Axios for HTTP requests

**Backend:**

- Node.js + Express.js
- MongoDB with Mongoose
- Caching mechanism for filter options (5-minute TTL)

## Search Implementation Summary

**Frontend (Index.jsx):**

- Real-time search via `SearchBar` component
- Search query debounced at the API call level (500ms)
- Search state synced with current page reset

**Backend (sales.controllers.js):**

- Regex-based search on `customerName` and `phoneNumber` fields
- Case-insensitive matching using `$regex: search, $options: "i"`
- Combined with active filters to refine results

**API (api.js):**

- `fetchSales({ search, filters, sort, page, limit })` endpoint
- Search param sent as query parameter

## Filter Implementation Summary

**Frontend (FilterBar.jsx, DateDropdown, RangeDropdown):**

- Multi-filter UI with dropdowns for region, gender, category, tags, payment method
- Age range slider with min/max input
- Date range picker with start/end date inputs
- Click-outside handling to close dropdowns
- Filters debounced 500ms before triggering API call

**Backend (sales.controllers.js):**

- `buildFilterQuery()` constructs MongoDB query from filter payload:
  - `region`, `gender`, `category`, `paymentMethod`: `$in` array matching
  - `age`: `$gte` and `$lte` range matching
  - `tags`: Comma-separated string matching with regex word boundaries
  - `dateRange`: String-based range comparison (converted to YYYY-MM-DD format for lexicographic sorting)
- Filters combined with `$and` logic to match all applied criteria

## Sorting Implementation Summary

**Frontend (Index.jsx, FilterBar.jsx):**

- Sort dropdown with six options: name (A-Z, Z-A), date (oldest, newest), quantity (ascending, descending)
- Selected sort passed to API via `sort` parameter

**Backend (sales.controllers.js):**

- Switch case on sort param to build MongoDB sort object:
  - `"date-asc"` → `{ date: 1 }`
  - `"date-desc"` → `{ date: -1 }`
  - `"name-asc"` → `{ customerName: 1 }`
  - `"name-desc"` → `{ customerName: -1 }`
  - `"quantity-asc/desc"` → `{ quantity: ±1 }`

## Pagination Implementation Summary

**Frontend (Index.jsx):**

- Tracks `currentPage` and `totalPages` state
- `Pagination` component handles page navigation (next/prev/direct)
- Results fetched per page with `limit: 15`
- Current page reset when filters or search changes

**Backend (sales.controllers.js):**

- Calculates `skip = (page - 1) * limit`
- Returns paginated data + metadata:
  - `total`: Total matching documents
  - `page`: Current page number
  - `pages`: Total pages
  - `hasNextPage` / `hasPrevPage`: Boolean flags for UI navigation
- Stats (totalQuantity, totalAmount, totalDiscount) calculated for current page only

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- MongoDB local instance or Atlas connection string
- React 18+

### Frontend Setup

1. Navigate to client directory and install dependencies:

```
cd frontend
npm install
```

2. Create `.env.local` (optional, if using custom API URL):

```
VITE_API_URL=http://localhost:5000
```

3. Start the development server:

```
npm run dev
```

### Backend Setup

1. Navigate to server directory and install dependencies:

```
cd backend
npm install
```

2. Create `.env` file:

```
MONGODB_URI=your_mongodburl
PORT=5000
NODE_ENV=development
```

3. Start the backend server:

```
npm start
```

### Running the Application

- **Frontend:** `http://localhost:5173` (Vite default)
- **Backend:** `http://localhost:5000`
- Ensure MongoDB is running before starting the backend
- Filter options are cached for 5 minutes to improve performance
