"""Tests for the public health-check endpoint."""
from __future__ import annotations


def test_health_check_returns_ok(client):
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == "ok"
    assert body["service"] == "waterpoint-board-api"
