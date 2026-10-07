# MetricMind Cube semantic layer

Cube exposes the dbt `sales_summary` model as a semantic API. It expects a PostgreSQL database containing `public.sales_summary`.

## Data model

`model/Sales.js` exposes the following measures:

- `Sales.totalOrders`, `Sales.totalUnitsSold`
- `Sales.totalRevenue`, `Sales.totalCost`, `Sales.totalProfit`
- `Sales.averageMargin`, calculated as total profit divided by total revenue

It exposes `year`, `quarter`, `region`, `country`, `product`, and `channel` as dimensions. Month and order date are not available because the dbt mart currently aggregates above that grain.

## Run locally

1. Make sure PostgreSQL is running and the dbt project has built `public.sales_summary`. The source table expected by dbt is `public.raw_sales`; set up a dbt profile for the `metricmind` database and load the CSV into that table before running dbt.
2. From this directory, install the Cube server packages:

   ```powershell
   npm install
   ```

3. Copy `.env.example` to `.env` and set the PostgreSQL credentials and a private `CUBEJS_API_SECRET`.
4. Start Cube:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:4000](http://localhost:4000) and use Playground to build queries against `Sales`.

Cube reads its connection details from the `CUBEJS_DB_*` variables. Do not commit `.env` or real credentials.

## Current boundary

Cube is a separate analytics API from the FastAPI service. The frontend is not yet connected to Cube. Natural-language question interpretation and the FastAPI-to-Cube integration still need to be implemented separately.
