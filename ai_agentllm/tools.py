
import os
from calendar import monthrange
from datetime import date, timedelta
import requests

from ai_agentllm.schemas import SemanticQuery


CUBE_API_URL = os.getenv(
    "CUBE_API_URL",
    "http://localhost:4000/cubejs-api/v1/load",
)


def get_date_range(time_range):
    if time_range is None:
        return None

    today = date.today()
    normalized = str(time_range).strip().lower()

    if normalized == "last month":
        first_this_month = date(today.year, today.month, 1)
        last_day_previous_month = first_this_month - timedelta(days=1)
        first_previous_month = date(
            last_day_previous_month.year,
            last_day_previous_month.month,
            1,
        )

        return [
            first_previous_month.isoformat(),
            last_day_previous_month.isoformat(),
        ]

    if normalized == "this month":
        return [
            date(today.year, today.month, 1).isoformat(),
            today.isoformat(),
        ]

    if normalized == "last year":
        return [
            date(today.year - 1, 1, 1).isoformat(),
            date(today.year - 1, 12, 31).isoformat(),
        ]

    if normalized == "this year":
        return [
            date(today.year, 1, 1).isoformat(),
            today.isoformat(),
        ]

    if normalized == "last quarter":
        current_quarter = (today.month - 1) // 3
        if current_quarter == 0:
            last_quarter_start = date(today.year - 1, 10, 1)
            last_quarter_end_month = 12
        else:
            last_quarter_start = date(today.year, current_quarter * 3 - 2, 1)
            last_quarter_end_month = current_quarter * 3

        last_quarter_end = date(
            last_quarter_start.year,
            last_quarter_end_month,
            monthrange(last_quarter_start.year, last_quarter_end_month)[1],
        )

        return [
            last_quarter_start.isoformat(),
            last_quarter_end.isoformat(),
        ]

    return None


def query_semantic_layer(query: SemanticQuery):
    if query is None:
        raise ValueError("Query cannot be None.")

    filters = query.filters or {}
    cube_filters = [
        {
            "member": field,
            "operator": "equals",
            "values": [value],
        }
        for field, value in filters.items()
    ]

    cube_query = {
        "measures": list(query.measures or []),
        "dimensions": list(query.dimensions or []),
        "filters": cube_filters,
    }

    date_range = get_date_range(query.time_range)

    if date_range:
        cube_query["timeDimensions"] = [
            {
                "dimension": "Sales.orderDate",
                "dateRange": date_range,
            }
        ]

    payload = {"query": cube_query}

    response = requests.post(
        CUBE_API_URL,
        json=payload,
        timeout=30,
    )

    response.raise_for_status()

    result = response.json()

    return result.get("data", [])
