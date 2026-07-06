import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """System Configurations for Fertilizer Recommendation Agent"""
    
    # Flask Settings
    SECRET_KEY = os.getenv("SECRET_KEY", "academic_flask_secret_2026")
    FLASK_ENV = os.getenv("FLASK_ENV", "production")

    # MongoDB Atlas credentials
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://admin:secure_password@cluster0.mongodb.net/fertilizer_db")
    DB_NAME = "fertilizer_agent"

    # LLM configurations
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    MODEL_NAME = "gemini-1.5-flash" # Default fallback for academic codes

    # ChromaDB (Vector DB) Storage path
    CHROMA_PERSIST_DIR = os.path.join(os.getcwd(), "chroma_db_store")
