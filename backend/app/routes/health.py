"""Public health-check endpoint used for deployment and monitoring checks."""
from __future__ import annotations

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def get_health():
    return jsonify({"status": "ok", "service": "waterpoint-board-api"})
