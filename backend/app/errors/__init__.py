"""Centralized API error handling.

Ensures the API never leaks tracebacks, SQL errors, or internal paths to clients.
"""
from __future__ import annotations

import uuid

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """Base class for application-level API errors with a stable error code."""

    def __init__(
        self,
        message: str,
        code: str = "APPLICATION_ERROR",
        status_code: int = 400,
        fields: dict | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.fields = fields or {}


def _error_body(code: str, message: str, fields: dict | None = None) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "fields": fields or {},
            "requestId": f"req_{uuid.uuid4().hex[:12]}",
        }
    }


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        response = jsonify(_error_body(error.code, error.message, error.fields))
        response.status_code = error.status_code
        return response

    @app.errorhandler(HTTPException)
    def handle_http_exception(error: HTTPException):
        response = jsonify(_error_body(f"HTTP_{error.code}", error.description or error.name))
        response.status_code = error.code or 500
        return response

    @app.errorhandler(Exception)
    def handle_unexpected_exception(error: Exception):  # noqa: ARG001
        app.logger.exception("Unhandled exception")
        response = jsonify(_error_body("INTERNAL_ERROR", "An unexpected error occurred."))
        response.status_code = 500
        return response
