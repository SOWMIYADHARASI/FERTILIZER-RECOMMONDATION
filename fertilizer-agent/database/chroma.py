import os
import chromadb
from chromadb.config import Settings

class ChromaVectorDB:
    """ChromaDB indexing engine for Retrieval-Augmented Generation (RAG)"""
    
    def __init__(self):
        self.persist_dir = os.path.join(os.getcwd(), "chroma_db_store")
        self.client = None
        self.collection = None
        
    def initialize_db(self):
        try:
            # Initialize local ChromaDB client
            self.client = chromadb.PersistentClient(path=self.persist_dir)
            self.collection = self.client.get_or_create_collection(
                name="agriculture_manuals"
            )
            
            # Seed default files if the vector store is empty
            if self.collection.count() == 0:
                print("Seeding ChromaDB with local crop and fertilizer guidelines...")
                self.seed_knowledge_base()
            else:
                print(f"ChromaDB loaded with {self.collection.count()} active vectors.")
        except Exception as e:
            print(f"ChromaDB initialization failed: {e}. Falling back to keyword search grounding.")
            
    def seed_knowledge_base(self):
        documents = [
            "For Nitrogen deficiencies, Urea (46% N) is highly recommended. Apply in split doses (basal, tillering, and flowering). Avoid flooded field broadcasting to prevent heavy ammonia volatilization.",
            "DAP (18-46-0) is an excellent starter fertilizer. Apply 2 inches below the seed furrow during sowing to supply phosphorus for robust root establishment.",
            "Potassium (K) is essential for water regulation and preventing disease. MOP (Muriate of Potash, 60% K) is applied during tillering or vegetative stages to prevent stem lodging.",
            "Acidic soil pH (< 5.2) locks up Phosphorus, making fertilizers ineffective. Apply dolomite lime or rich compost to buffer soil towards neutral (6.0 - 7.0).",
            "Drip irrigation and fertigation decrease water loss by 40% and increase nutrient absorption accuracy by delivering soluble fertilizers directly to root capillaries."
        ]
        
        ids = [f"doc_{i}" for i in range(len(documents))]
        metadatas = [{"source": "CIAS_Government_Manual"} for _ in range(len(documents))]
        
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print("Knowledge vectors seeded successfully.")

    def query_vectors(self, query_text, n_results=2):
        if self.collection is None:
            return []
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results
            )
            return results['documents'][0] if 'documents' in results else []
        except Exception as e:
            print(f"Vector search failed: {e}")
            return []

# Singleton instance
vector_db = ChromaVectorDB()
vector_db.initialize_db()
