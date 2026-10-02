
from fastapi import FastAPI, HTTPException

import pandas as pd

app = FastAPI()

data = pd.read_csv("data/MetricMind_Corporate_Sales_Dataset.csv")

@app.get("/")
def home():
    return {"message": "MetricMind API is running"}

@app.get("/sales")
def get_sales():
    return
data.to_dict(orient="records")

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