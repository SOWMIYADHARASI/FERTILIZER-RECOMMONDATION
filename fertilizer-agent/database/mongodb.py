import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

class MongoDatabase:
    """MongoDB helper class for storing and retrieving prediction audits and chats"""
    
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("DB_NAME", "fertilizer_agent_db")
        self.client = None
        self.db = None
        
    def connect(self):
        try:
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[self.db_name]
            # Verify connection
            self.client.server_info()
            print("MongoDB Atlas connected successfully.")
        except Exception as e:
            print(f"MongoDB connection failed: {e}. Falling back to clean local simulations.")
            self.db = None
            
    def get_collection(self, name):
        if self.db is not None:
            return self.db[name]
        return None

# Singleton instance
mongo_db = MongoDatabase()
mongo_db.connect()
