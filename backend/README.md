# MetricMind FastAPI Backend

FastAPI provides the browser-facing API and forwards semantic queries to Cube.

## Run locally

From the repository root, start the API with:

```powershell
python -m uvicorn backend.main:app --reload
```

Run Cube separately from the `cube` folder with `npm run dev`. With both services
running, send a `POST` request to `/cube/query` on the FastAPI server. For example:

```json
{
	"measures": ["Sales.totalRevenue"],
	"dimensions": ["Sales.region"]
}
```

The Cube URL defaults to `http://localhost:4000/cubejs-api/v1/load`. Set
`CUBE_API_URL` if Cube is hosted elsewhere.

## Endpoints

- `POST /cube/query` - forwards a Cube `measures`/`dimensions`/`filters` query
- `GET /` - API liveness check
- `GET /summary` and `GET /summary/...` - legacy CSV-backed summaries

The Cube URL defaults to `http://localhost:4000/cubejs-api/v1/load`. Set
`CUBE_API_URL` in the FastAPI process environment to use another address. Local
Next.js origins `localhost:3000` and `127.0.0.1:3000` are allowed by CORS.

## Run locally

From the repository root:

```powershell
python -m pip install fastapi uvicorn pandas requests
python -m uvicorn backend.main:app --reload
```

Interactive API documentation:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
