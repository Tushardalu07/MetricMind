import os
import pandas as pd
from sqlalchemy import create_engine

df = pd.read_csv("backend/data/MetricMind_Corporate_Sales_Dataset.csv")

summary = (
    df.groupby(["Year", "Quarter", "Region", "Country", "Product", "Channel"], as_index=False)
    .agg(
        total_orders=("Order_ID", "count"),
        total_revenue=("Revenue", "sum"),
        total_profit=("Profit", "sum"),
        total_cost=("Total_Cost", "sum"),
        total_units_sold=("Units_Sold", "sum"),
    )
)
summary.columns = [c.lower() for c in summary.columns]

engine = create_engine(os.environ["NEON_DB_URL"])
summary.to_sql("sales_summary", engine, schema="public", if_exists="replace", index=False)

print(f"Loaded {len(summary)} rows into public.sales_summary")
print("Columns:", list(summary.columns))