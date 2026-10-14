# MetricMind

MetricMind is a sales analytics application. Its local request flow is:

```text
Browser (Next.js) -> FastAPI -> Cube -> PostgreSQL
```

The frontend sends Cube semantic queries to `POST /cube/query` on FastAPI. The
older CSV-backed summary endpoints remain available for direct API use.

## Prerequisites

- Python 3.11 or newer, with FastAPI, Uvicorn, pandas, and Requests
- Node.js and npm
- PostgreSQL, with the `metricmind` database and `public.raw_sales` source table
- dbt Core with a PostgreSQL adapter and a `metricmind_dbt` profile

The `public.raw_sales` table must contain the fields selected in
`metricmind_dbt/models/staging/stg_raw_sales.sql`. Configure the dbt profile in
`~/.dbt/profiles.yml`, load the CSV data into that table, then build the mart:

```powershell
Set-Location metricmind_dbt
dbt run
```

This creates `public.sales_summary`, which Cube queries.

## Run locally

Start each service in a separate terminal from the repository root.

1. Start Cube. Copy `cube/.env.example` to `cube/.env`, set the PostgreSQL
	connection values and a private `CUBEJS_API_SECRET`, then run:

	```powershell
	Set-Location cube
	npm install
	npm run dev
	```

2. Start FastAPI:

	```powershell
	python -m pip install fastapi uvicorn pandas requests
	python -m uvicorn backend.main:app --reload
	```

3. Start the frontend:

	```powershell
	Set-Location frontend
	npm install
	npm run dev
	```

Open [http://localhost:3000](http://localhost:3000). FastAPI's interactive API
docs are at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## Query API

The frontend maps its supported sales prompts to Cube measures, dimensions, and
filters. You can also call the endpoint directly:

```json
{
  "measures": ["Sales.totalRevenue"],
  "dimensions": ["Sales.region"]
}
```

Send this JSON as a `POST` to `http://127.0.0.1:8000/cube/query`. The Cube API
defaults to `http://localhost:4000/cubejs-api/v1/load`; set `CUBE_API_URL` for a
different Cube address. The current mart supports year and quarter summaries,
but not month-level or order-date queries.
