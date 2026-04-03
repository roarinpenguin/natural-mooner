import os
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from openai import OpenAI
from typing import List, Dict, Optional


class EmbeddingsService:
    def __init__(self, db_path: str = "data/feedback.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self.default_api_key = os.getenv("OPENAI_API_KEY")

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_prompt TEXT NOT NULL,
                generated_script TEXT NOT NULL,
                corrected_script TEXT NOT NULL,
                error_message TEXT,
                embedding BLOB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()

    def _get_embedding(self, text: str, api_key: Optional[str] = None) -> List[float]:
        key = api_key or self.default_api_key
        if not key:
            raise ValueError("OpenAI API Key is required for embeddings")
        
        client = OpenAI(api_key=key)
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding

    def store_feedback(
        self,
        original_prompt: str,
        generated_script: str,
        corrected_script: str,
        error_message: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> bool:
        try:
            combined_text = f"Prompt: {original_prompt}\n\nCorrected Script:\n{corrected_script}"
            embedding = self._get_embedding(combined_text, api_key)
            embedding_blob = json.dumps(embedding).encode('utf-8')
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO feedback (original_prompt, generated_script, corrected_script, error_message, embedding)
                VALUES (?, ?, ?, ?, ?)
            """, (original_prompt, generated_script, corrected_script, error_message, embedding_blob))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error storing feedback: {e}")
            return False

    def find_similar_examples(
        self,
        query_prompt: str,
        top_k: int = 3,
        api_key: Optional[str] = None
    ) -> List[Dict]:
        try:
            query_embedding = self._get_embedding(query_prompt, api_key)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, original_prompt, corrected_script, embedding
                FROM feedback
            """)
            rows = cursor.fetchall()
            conn.close()
            
            if not rows:
                return []
            
            similarities = []
            for row in rows:
                feedback_id, prompt, script, embedding_blob = row
                stored_embedding = json.loads(embedding_blob.decode('utf-8'))
                similarity = self._cosine_similarity(query_embedding, stored_embedding)
                similarities.append({
                    'id': feedback_id,
                    'prompt': prompt,
                    'script': script,
                    'similarity': similarity
                })
            
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            return similarities[:top_k]
        except Exception as e:
            print(f"Error finding similar examples: {e}")
            return []

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        return dot_product / (magnitude1 * magnitude2)

    def get_feedback_count(self) -> int:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM feedback")
        count = cursor.fetchone()[0]
        conn.close()
        return count
