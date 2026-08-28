"""Pytest fixtures shared across the backend test suite."""
from __future__ import annotations

import pytest

from app import create_app


@pytest.fixture()
def app():
    application = create_app("testing")
    with application.app_context():
        yield application


@pytest.fixture()
def client(app):
    return app.test_client()
