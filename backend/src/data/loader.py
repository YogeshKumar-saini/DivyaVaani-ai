"""Data loader for the comprehensive spiritual knowledge base."""

import pandas as pd
import pdfplumber
from pathlib import Path
from typing import List, Dict, Any, Optional
from src.config import settings
from src.utils.logger import log

class ComprehensiveDataLoader:
    """Loader for various data formats (PDF, CSV, Excel)."""

    def __init__(self):
        # Use the parent of the backend directory + data, or just relative 'data' if running from backend root
        # settings.data_path is a file path, we want the directory.
        # Assuming data is in backend/data
        self.data_dir = Path("data") 

    def load_all_data(self) -> pd.DataFrame:
        """Load all supported files from the data directory."""
        all_data = []
        
        if not self.data_dir.exists():
            log.warning(f"Data directory {self.data_dir} does not exist")
            return pd.DataFrame(columns=['content', 'source_file', 'file_type', 'language', 'title'])
            
        log.info(f"Scanning data directory: {self.data_dir.absolute()}")
        
        for file_path in self.data_dir.glob("**/*"):
            if file_path.is_file() and not file_path.name.startswith('.'):
                try:
                    content = self._load_file(file_path)
                    if content:
                        all_data.extend(content)
                        log.info(f"Loaded {len(content)} records from {file_path.name}")
                except Exception as e:
                    log.error(f"Error loading file {file_path}: {e}")
                    
        if not all_data:
            log.warning("No data loaded!")
            return pd.DataFrame(columns=['content', 'source_file', 'file_type', 'language', 'title'])
            
        df = pd.DataFrame(all_data)
        log.info(f"Total records loaded: {len(df)}")
        return df

    def load_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Load content from a specific file."""
        return self._load_file(file_path)

    def _load_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Dispatch load based on file extension."""
        suffix = file_path.suffix.lower()
        if suffix == '.pdf':
            return self._load_pdf(file_path)
        elif suffix in ['.csv', '.xls', '.xlsx']:
            return self._load_tabular(file_path)
        elif suffix == '.txt':
            return self._load_text(file_path)
        return []

    def _load_text(self, file_path: Path) -> List[Dict[str, Any]]:
        """Load content from text file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    return [{
                        'content': content,
                        'source_file': file_path.name,
                        'file_type': 'txt',
                        'language': self._detect_language(content),
                        'title': file_path.stem
                    }]
        except Exception as e:
            log.error(f"Error reading text file {file_path}: {e}")
        return []

    def _load_pdf(self, file_path: Path) -> List[Dict[str, Any]]:
        """Load content from PDF file."""
        data = []
        try:
            with pdfplumber.open(file_path) as pdf:
                full_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n\n"
                
                # For now, treat the whole PDF as one document or split by pages?
                # Better to split by pages or paragraphs for RAG.
                # Let's split by pages for now to have some granularity.
                
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if text and len(text.strip()) > 50: # Filter very short pages
                        data.append({
                            'content': text.strip(),
                            'source_file': file_path.name,
                            'file_type': 'pdf',
                            'language': self._detect_language(text),
                            'title': f"{file_path.stem} - Page {i+1}"
                        })
                        
        except Exception as e:
            log.error(f"Error reading PDF {file_path}: {e}")
        return data

    def _load_tabular(self, file_path: Path) -> List[Dict[str, Any]]:
        """Load content from CSV/Excel file."""
        data = []
        try:
            if file_path.suffix == '.csv':
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
            
            # Normalize columns
            df.columns = [str(c).lower().strip() for c in df.columns]
            
            for _, row in df.iterrows():
                content = ""
                
                # Priority columns for content
                if 'content' in df.columns and pd.notna(row['content']):
                    content = str(row['content'])
                elif 'text' in df.columns and pd.notna(row['text']):
                    content = str(row['text'])
                elif 'verse' in df.columns and pd.notna(row['verse']):
                    content = str(row['verse'])
                    if 'translation' in df.columns and pd.notna(row['translation']):
                        content += "\nTranslation: " + str(row['translation'])
                    if 'purport' in df.columns and pd.notna(row['purport']):
                        content += "\nPurport: " + str(row['purport'])
                else:
                    # Fallback: combine all columns
                    content = " | ".join([f"{k}: {v}" for k, v in row.items() if pd.notna(v)])
                
                if content and len(content.strip()) > 10:
                    data.append({
                        'content': content.strip(),
                        'source_file': file_path.name,
                        'file_type': file_path.suffix[1:],
                        'language': row.get('language', 'en'),
                        'title': row.get('title', file_path.stem)
                    })
        except Exception as e:
            log.error(f"Error reading tabular file {file_path}: {e}")
        return data

    def _detect_language(self, text: str) -> str:
        """Detect language of text using langdetect.
        
        Args:
            text: Text to detect language from
            
        Returns:
            Language code (en, hi, sa, etc.) or 'en' as fallback
        """
        try:
            from langdetect import detect
            lang = detect(text[:500])  # Use first 500 chars for detection
            return lang
        except Exception:
            return 'en'  # Default to English if detection fails
