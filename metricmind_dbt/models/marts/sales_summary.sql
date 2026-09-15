select
    year,
    quarter,
    region,
    country,
    product,
    channel,
    sum(units_sold) as total_units_sold,
    sum(revenue) as total_revenue,
    sum(total_cost) as total_cost,
    sum(profit) as total_profit,
    avg(margin_percent) as avg_margin_percent
from {{ ref('stg_raw_sales') }}
group by
    year,
    quarter,
    region,
    country,
    product,
    channel