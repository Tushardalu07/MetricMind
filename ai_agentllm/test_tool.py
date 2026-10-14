import unittest
from unittest.mock import Mock, patch

import requests
from fastapi.testclient import TestClient

from ai_agentllm.schemas import SemanticQuery
from ai_agentllm.tools import get_date_range, query_semantic_layer
from backend.main import app


class TestSemanticTools(unittest.TestCase):

    @patch("ai_agentllm.tools.requests.post")
    def test_revenue_query_payload(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "data": [{"Sales.totalRevenue": "1000"}]
        }
        mock_post.return_value = mock_response

        query = SemanticQuery(
            measures=["Sales.totalRevenue"],
            dimensions=["Sales.country"],
            filters={"Sales.country": "India"},
        )

        result = query_semantic_layer(query)

        self.assertEqual(result, [{"Sales.totalRevenue": "1000"}])
        mock_post.assert_called_once()

        payload = mock_post.call_args.kwargs["json"]
        cube_query = payload["query"]

        self.assertEqual(cube_query["measures"], ["Sales.totalRevenue"])
        self.assertEqual(cube_query["dimensions"], ["Sales.country"])
        self.assertEqual(
            cube_query["filters"][0]["member"],
            "Sales.country",
        )
        self.assertEqual(
            cube_query["filters"][0]["values"],
            ["India"],
        )

    @patch("backend.main.query_semantic_layer")
    def test_fastapi_cube_route_calls_semantic_layer(self, mock_query):
        mock_query.return_value = [{"Sales.totalRevenue": "1000"}]
        client = TestClient(app)

        response = client.post(
            "/cube/query",
            json={"measures": ["Sales.totalRevenue"]},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [{"Sales.totalRevenue": "1000"}])
        mock_query.assert_called_once()

    @patch("backend.main.query_semantic_layer")
    def test_fastapi_cube_route_maps_connection_errors(self, mock_query):
        mock_query.side_effect = requests.ConnectionError()
        client = TestClient(app)

        response = client.post(
            "/cube/query",
            json={"measures": ["Sales.totalRevenue"]},
        )

        self.assertEqual(response.status_code, 502)

    def test_fastapi_allows_frontend_cube_query_preflight(self):
        client = TestClient(app)

        response = client.options(
            "/cube/query",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["access-control-allow-origin"],
            "http://localhost:3000",
        )

    def test_last_month_date_range(self):
        result = get_date_range("last month")

        self.assertEqual(len(result), 2)
        self.assertLessEqual(result[0], result[1])
        self.assertEqual(result[0][8:10], "01")

    def test_unknown_time_range(self):
        self.assertIsNone(get_date_range(None))


if __name__ == "__main__":
    unittest.main()
