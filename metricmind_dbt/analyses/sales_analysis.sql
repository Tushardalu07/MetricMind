select
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
from {{ ref('sales_summary') }}
order by year, quarter;