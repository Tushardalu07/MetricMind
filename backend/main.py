
import os
from pathlib import Path

import pandas as pd
import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

# --------------------------------------------------
# Application setup
# --------------------------------------------------

app = FastAPI(title="MetricMind API")

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Load environment variables from project root .env
load_dotenv(PROJECT_ROOT / ".env")

# Keep existing CSV-based endpoints working
CSV_PATH = BASE_DIR / "data" / "MetricMind_Corporate_Sales_Dataset.csv"
data = pd.read_csv(CSV_PATH)


# --------------------------------------------------
# PostgreSQL connection
# --------------------------------------------------

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=os.getenv("PGPORT", "5432"),
        dbname=os.getenv("PGDATABASE", "metricmind"),
        user=os.getenv("PGUSER", "metricmind"),
        password=os.getenv("PGPASSWORD"),
        connect_timeout=5,
    )


# --------------------------------------------------
# Home
# --------------------------------------------------

@app.get("/")
def home():
    return {"message": "MetricMind API is running"}


# --------------------------------------------------
# Existing CSV endpoints
# --------------------------------------------------

@app.get("/sales")
def get_sales():
    return data.to_dict(orient="records")


@app.get("/summary")
def get_summary():
    return {
        "total_orders": int(len(data)),
        "total_revenue": round(float(data["Revenue"].sum()), 2),
        "total_profit": round(float(data["Profit"].sum()), 2),
        "total_units_sold": int(data["Units_Sold"].sum()),
    }


@app.get("/sales/region/{region}")
def get_sales_by_region(region: str):
    filtered_data = data[
        data["Region"].astype(str).str.lower() == region.lower()
    ]
    return filtered_data.to_dict(orient="records")


@app.get("/summary/region/{region}")
def get_region_summary(region: str):
    filtered_data = data[
        data["Region"].astype(str).str.lower() == region.lower()
    ]

    return {
        "region": region,
        "total_orders": int(len(filtered_data)),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(float(filtered_data["Revenue"].sum()), 2),
        "total_profit": round(float(filtered_data["Profit"].sum()), 2),
    }


@app.get("/summary/product/{product}")
def get_product_summary(product: str):
    filtered_data = data[
        data["Product"].astype(str).str.lower() == product.lower()
    ]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Product '{product}' not found",
        )

    return {
        "product": product,
        "total_orders": int(len(filtered_data)),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(float(filtered_data["Revenue"].sum()), 2),
        "total_profit": round(float(filtered_data["Profit"].sum()), 2),
    }


@app.get("/summary/channel/{channel}")
def get_channel_summary(channel: str):
    filtered_data = data[
        data["Channel"].astype(str).str.lower() == channel.lower()
    ]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Channel '{channel}' not found",
        )

    return {
        "channel": channel,
        "total_orders": int(len(filtered_data)),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(float(filtered_data["Revenue"].sum()), 2),
        "total_profit": round(float(filtered_data["Profit"].sum()), 2),
    }


@app.get("/summary/year/{year}")
def get_year_summary(year: int):
    filtered_data = data[data["Year"] == year]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Year '{year}' not found",
        )

    return {
        "year": year,
        "total_orders": int(len(filtered_data)),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(float(filtered_data["Revenue"].sum()), 2),
        "total_profit": round(float(filtered_data["Profit"].sum()), 2),
    }


@app.get("/summary/month/{month}")
def get_month_summary(month: int):
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=400,
            detail="Month must be between 1 and 12",
        )

    filtered_data = data[data["Month"] == month]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Month '{month}' not found",
        )

    return {
        "month": month,
        "total_orders": int(len(filtered_data)),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(float(filtered_data["Revenue"].sum()), 2),
        "total_profit": round(float(filtered_data["Profit"].sum()), 2),
    }


@app.get("/summary/cost-profit")
def get_cost_profit_summary():
    return {
        "total_material_cost": round(
            float(data["Material_Cost"].sum()), 2
        ),
        "total_shipping_cost": round(
            float(data["Shipping_Cost"].sum()), 2
        ),
        "total_labor_cost": round(
            float(data["Labor_Cost"].sum()), 2
        ),
        "total_marketing_cost": round(
            float(data["Marketing_Cost"].sum()), 2
        ),
        "total_cost": round(float(data["Total_Cost"].sum()), 2),
        "total_profit": round(float(data["Profit"].sum()), 2),
        "average_margin_percent": round(
            float(data["Margin_Percent"].mean()), 2
        ),
    }


# --------------------------------------------------
# New dbt + PostgreSQL endpoint
# --------------------------------------------------

@app.get("/dbt/sales-summary")
def get_dbt_sales_summary():
    conn = None

    try:
        conn = get_db_connection()

        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    year,
                    quarter,
                    region,
                    country,
                    product,
                    channel,
                    total_units_sold,
                    total_revenue,
                    total_cost,
                    total_profit,
                    avg_margin_percent
                FROM public.sales_summary
                ORDER BY year, quarter, region
                LIMIT 100
                """
            )

            columns = [description[0] for description in cur.description]
            rows = cur.fetchall()

            return [
                dict(zip(columns, row))
                for row in rows
            ]

    except psycopg2.Error as exc:
        # Avoid exposing database credentials or internal error details.
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not read public.sales_summary. "
                "Check PostgreSQL credentials and confirm the dbt model exists."
            ),
        ) from exc

    finally:
        if conn is not None:
            conn.close()

# --------------------------------------------------
# summary/cost-profit
# --------------------------------------------------
@app.get("/summary/quarter/{quarter}")
def get_quarter_summary(quarter: str):
    filtered_data = data[
        data["Quarter"].astype(str).str.upper() == quarter.upper()
    ]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Quarter '{quarter}' not found",
        )

    return {
        "quarter": quarter.upper(),
        "total_orders": int(len(filtered_data)),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(float(filtered_data["Revenue"].sum()), 2),
        "total_profit": round(float(filtered_data["Profit"].sum()), 2),
    }