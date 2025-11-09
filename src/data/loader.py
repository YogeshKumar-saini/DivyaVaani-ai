"""Data loading and preprocessing."""

import re
import pandas as pd
from typing import Optional
from pathlib import Path
from src.utils.logger import log


class DataLoader:
    """Load and preprocess Bhagavad Gita data."""
    
    def __init__(self, data_path: str):
        self.data_path = Path(data_path)
        self.df: Optional[pd.DataFrame] = None
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text."""
        if pd.isna(text):
            return ""
        
        text = str(text)
        # Remove zero-width characters
        text = text.replace('\u200d', '').replace('\u200c', '')
        # Normalize whitespace
        text = text.replace('\r', ' ').replace('\n', ' ')
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def load(self) -> pd.DataFrame:
        """Load and process CSV data."""
        try:
            log.info(f"Loading data from {self.data_path}")
            
            # Read CSV
            df_raw = pd.read_csv(
                self.data_path,
                quoting=1,
                engine='python',
                dtype=str
            )
            
            # Handle columns
            if df_raw.shape[1] >= 8:
                df = df_raw.iloc[:, 1:8].copy()
                df.columns = [
                    "verse_number",
                    "verse_in_sanskrit",
                    "sanskrit_verse_transliteration",
                    "translation_in_english",
                    "meaning_in_english",
                    "translation_in_hindi",
                    "meaning_in_hindi"
                ]
            else:
                df = df_raw
            
            # Clean all text columns
            for col in df.columns:
                df[col] = df[col].apply(self.clean_text)
            
            # Create combined columns
            df['combined_en'] = (
                df['translation_in_english'].fillna('') + " " +
                df['meaning_in_english'].fillna('') + " " +
                df['sanskrit_verse_transliteration'].fillna('')
            ).str.strip()
            
            df['combined_hi'] = (
                df['translation_in_hindi'].fillna('') + " " +
                df['meaning_in_hindi'].fillna('')
            ).str.strip()
            
            df['combined_sa'] = df['verse_in_sanskrit'].fillna('').str.strip()
            
            self.df = df
            log.info(f"Loaded {len(df)} verses successfully")
            return df
            
        except Exception as e:
            log.error(f"Error loading data: {e}")
            raise
    
    def get_dataframe(self) -> pd.DataFrame:
        """Get loaded dataframe."""
        if self.df is None:
            return self.load()
        return self.df
