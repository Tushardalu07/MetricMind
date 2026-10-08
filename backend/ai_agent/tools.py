from langchain_core.tools import tool


@tool
def semantic_query(
    metric: str,
    dimension: str = "",
    region: str = "",
    quarter: str = ""
) -> str:
    """
    Query the governed semantic layer.

    Use this tool exactly once to retrieve approved business
    metrics. Never pass SQL to this tool.
    """

    allowed_metrics = {
        "revenue": "Revenue",
        "cost": "Cost",
        "margin": "Margin"
    }

    metric_key = metric.strip().lower()

    if metric_key not in allowed_metrics:
        return (
            f"Metric '{metric}' is not available. "
            "Available metrics: Revenue, Cost, Margin."
        )

    official_metric = allowed_metrics[metric_key]

    print("\n[Semantic Layer]")
    print("Metric:", official_metric)
    print("Dimension:", dimension)
    print("Region:", region)
    print("Quarter:", quarter)

    # Temporary mock semantic-layer response
    return (
        f"Retrieved governed metric successfully. "
        f"Metric: {official_metric}; "
        f"Dimension: {dimension}; "
        f"Region: {region}; "
        f"Quarter: {quarter}; "
        f"Value: 1200000"
    )