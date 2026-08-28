"""Application factory for the WaterPoint Board Uganda API."""
from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from app.config import get_config
from app.errors import register_error_handlers
from app.extensions import db, limiter, migrate


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure the Flask application instance."""
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        supports_credentials=True,
    )

    register_error_handlers(app)

    from app.routes.health import health_bp

    app.register_blueprint(health_bp, url_prefix="/api/v1")

    return app
