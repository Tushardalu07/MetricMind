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

## Application integration

The frontend sends supported chat questions to FastAPI as semantic queries.
FastAPI calls Cube at `/cubejs-api/v1/load` and returns the result rows to the
browser. FastAPI defaults to `http://localhost:4000`; set `CUBE_API_URL` in the
FastAPI process environment to use another Cube host.

The current mart is aggregated by year, quarter, region, country, product, and
channel. It does not expose order-date or month-level dimensions, so those
queries are not supported yet.
