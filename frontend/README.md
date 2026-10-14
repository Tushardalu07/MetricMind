# MetricMind Frontend

The Next.js chat interface sends supported sales questions to FastAPI, which
forwards semantic queries to Cube. Results are shown as text and charts.

## Run locally

From this directory:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). FastAPI must be running at
`http://127.0.0.1:8000`, and Cube must be available to FastAPI at
`http://localhost:4000`. Override the browser-facing API URL by setting
`NEXT_PUBLIC_API_URL` before starting Next.js.

## Chat query flow

The chat maps common sales prompts to Cube measures, dimensions, and filters,
then sends them as JSON to `POST /cube/query`. The Cube request is available in
the chat's API panel. The current data mart supports year and quarter grouping;
month-level or order-date questions are not supported by the Cube model yet.

The frontend uses Next.js, React, TypeScript, Tailwind CSS, ECharts, and Lucide.
