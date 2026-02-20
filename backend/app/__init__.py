import os
from flask import Flask
from flask_jwt_extended import JWTManager
from app.extensions import db, Migrate
from app.config import Config

jwt = JWTManager()
migrate = Migrate()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Use test config if specified
    if config_name == 'testing':
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
        app.config['TESTING'] = True
    else:
        app.config.from_object(Config)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "test-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = os.getenv("FRONTEND_URL", "http://localhost:3000")
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Blueprints AFTER CORS
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.hr import hr_bp
    from app.routes.leave import leave_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(hr_bp)
    app.register_blueprint(leave_bp)
    app.register_blueprint(admin_bp)

    return app