
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data = pd.read_csv("data/MetricMind_Corporate_Sales_Dataset.csv")

@app.get("/")
def home():
    return {"message": "MetricMind API is running"}

@app.get("/sales")
def get_sales():
    return data.to_dict(orient="records")

@app.get("/summary")
def get_summary():
    return {
        "total_orders": len(data),
        "total_revenue": round(data["Revenue"].sum(), 2),
        "total_profit": round(data["Profit"].sum(), 2),
        "total_units_sold": int(data["Units_Sold"].sum())
    }

@app.get("/sales/region/{region}")
def get_sales_by_region(region: str):
    filtered_data = data[data["Region"].str.lower() == region.lower()]
    return filtered_data.to_dict(orient="records")

@app.get("/summary/region/{region}")
def get_region_summary(region: str):
    filtered_data = data[data["Region"].str.lower() == region.lower()]

    return {
        "region": region,
        "total_orders": len(filtered_data),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(filtered_data["Revenue"].sum(), 2),
        "total_profit": round(filtered_data["Profit"].sum(), 2)
    }

@app.get("/summary/product/{product}")
def get_product_summary(product: str):
    filtered_data = data[data["Product"].str.lower() == product.lower()]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Product '{product}' not found"
        )

    return {
        "product": product,
        "total_orders": len(filtered_data),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(filtered_data["Revenue"].sum(), 2),
        "total_profit": round(filtered_data["Profit"].sum(), 2)
    }

@app.get("/summary/channel/{channel}")
def get_channel_summary(channel: str):
    filtered_data = data[data["Channel"].str.lower() == channel.lower()]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Channel '{channel}' not found"
        )

    return {
        "channel": channel,
        "total_orders": len(filtered_data),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(filtered_data["Revenue"].sum(), 2),
        "total_profit": round(filtered_data["Profit"].sum(), 2)
    }

@app.get("/summary/year/{year}")
def get_year_summary(year: int):
    filtered_data = data[data["Year"] == year]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Year '{year}' not found"
        )

    return {
        "year": year,
        "total_orders": len(filtered_data),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(filtered_data["Revenue"].sum(), 2),
        "total_profit": round(filtered_data["Profit"].sum(), 2)
    }

@app.get("/summary/month/{month}")
def get_month_summary(month: int):
    filtered_data = data[data["Month"] == month]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Month '{month}' not found"
        )

    return {
        "month": month,
        "total_orders": len(filtered_data),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(filtered_data["Revenue"].sum(), 2),
        "total_profit": round(filtered_data["Profit"].sum(), 2)
    }

@app.get("/summary/cost-profit")
def get_cost_profit_summary():
    return {
        "total_material_cost": round(data["Material_Cost"].sum(), 2),
        "total_shipping_cost": round(data["Shipping_Cost"].sum(), 2),
        "total_labor_cost": round(data["Labor_Cost"].sum(), 2),
        "total_marketing_cost": round(data["Marketing_Cost"].sum(), 2),
        "total_cost": round(data["Total_Cost"].sum(), 2),
        "total_profit": round(data["Profit"].sum(), 2),
        "average_margin_percent": round(data["Margin_Percent"].mean(), 2)
    }

@app.get("/summary/quarter/{quarter}")
def get_quarter_summary(quarter: str):
    filtered_data = data[
        data["Quarter"].str.upper() == quarter.upper()
    ]

    if filtered_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Quarter '{quarter}' not found"
        )

    return {
        "quarter": quarter.upper(),
        "total_orders": len(filtered_data),
        "total_units_sold": int(filtered_data["Units_Sold"].sum()),
        "total_revenue": round(filtered_data["Revenue"].sum(), 2),
        "total_profit": round(filtered_data["Profit"].sum(), 2)
    }
