import os
import google.generativeai as genai
from database.chroma import vector_db
from dotenv import load_dotenv

load_dotenv()

class AgricultureChatbot:
    """Agricultural Chat assistant leveraging RAG and Prompt Engineering principles"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
            print("Gemini API key missing in Python environment config.")
            
    def generate_response(self, user_query, current_crop_context=None):
        if not self.model:
            return "Please configure GEMINI_API_KEY inside your .env environment to enable live agricultural analysis."
            
        # 1. Retrieve Grounding Context from ChromaDB (RAG)
        context_docs = vector_db.query_vectors(user_query, n_results=2)
        context_str = "\n".join(context_docs) if context_docs else "No specific context retrieved."
        
        # 2. Build Structured Prompt Engineering
        system_instruction = (
            "You are a professional agricultural scientist and farm extension advisor.\n"
            "Answer farmer questions, offer irrigation recommendations, diagnose plant diseases, "
            "and suggest fertilizer usage based on retrieved crop guidelines and standard scientific manuals.\n"
            "Provide responses in clear, supportive language under 250 words.\n\n"
            f"[RETRIEVED AGRI-KNOWLEDGE CONTEXT (ChromaDB)]:\n{context_str}\n"
        )
        
        if current_crop_context:
            system_instruction += f"\n[ACTIVE CROP PARAMETERS]:\n{current_crop_context}\n"
            
        # 3. Request generation
        try:
            # We combine instruction and user query in the prompt
            full_prompt = f"{system_instruction}\n\nFarmer Question: {user_query}\n\nAnswer:"
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return f"Gemini API Error: {e}. Check your credentials or connection."

# Singleton
agri_chatbot = AgricultureChatbot()
