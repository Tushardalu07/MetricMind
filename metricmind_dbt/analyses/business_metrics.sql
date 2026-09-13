select
    year,
    sum(total_revenue) as total_revenue,
    sum(total_profit) as total_profit,
    avg(avg_margin_percent) as avg_margin_percent
from {{ ref('sales_summary') }}
group by year
order by year;