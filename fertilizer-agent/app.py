import os
from flask import Flask, render_react_template, render_template, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load configurations
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "agri_agent_secret_key_2026")
CORS(app)

# Import blueprints
from routes.home import home_bp
from routes.recommend import recommend_bp
from routes.chat import chat_bp
from routes.history import history_bp
from routes.admin import admin_bp

# Register blueprints
app.register_blueprint(home_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(history_bp)
app.register_blueprint(admin_bp)

# Error handler for 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    app.run(host=host, port=port, debug=debug)
