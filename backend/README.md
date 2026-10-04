# MetricMind FastAPI Backend

This folder contains the FastAPI backend for the MetricMind project.

The backend will provide APIs for:

- Query processing
- Chat interaction
- Cube.dev integration
- AI Agent integration
- Frontend communication

## FastAPI Endpoints

The backend provides API endpoints for analyzing corporate sales data.

### Summary APIs

- /summary - Returns overall sales summary
- /summary/region/{region} - Returns sales summary by region
- /summary/product/{product} - Returns sales summary by product
- /summary/channel/{channel} - Returns sales summary by channel
- /summary/year/{year} - Returns sales summary by year
- /summary/month/{month} - Returns sales summary by month
- /summary/quarter/{quarter} - Returns sales summary by quarter
- /summary/cost-profit - Returns cost and profit analysis

### API Documentation

FastAPI provides interactive API documentation through Swagger UI:

http://127.0.0.1:8000/docs