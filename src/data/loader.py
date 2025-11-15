"""Comprehensive data loading and preprocessing for all spiritual texts."""

import re
import pandas as pd
from typing import Optional, List, Dict, Any
from pathlib import Path
import fitz  # PyMuPDF for PDF processing
from src.utils.logger import log


class ComprehensiveDataLoader:
    """Load and preprocess all spiritual text data from multiple sources."""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.df: Optional[pd.DataFrame] = None
        self.supported_extensions = {'.csv', '.pdf', '.xlsx', '.xls'}

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

    def get_all_files(self) -> List[Path]:
        """Get all supported files from data directory."""
        files = []
        for ext in self.supported_extensions:
            files.extend(self.data_dir.glob(f"*{ext}"))
        return sorted(files)

    def load_csv_file(self, file_path: Path) -> pd.DataFrame:
        """Load and process CSV file."""
        try:
            log.info(f"Loading CSV: {file_path}")

            # Try different encodings
            encodings = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']
            df = None

            for encoding in encodings:
                try:
                    df = pd.read_csv(
                        file_path,
                        quoting=1,
                        engine='python',
                        dtype=str,
                        encoding=encoding
                    )
                    break
                except UnicodeDecodeError:
                    continue

            if df is None:
                raise ValueError(f"Could not decode {file_path} with any encoding")

            # Handle different CSV formats
            if df.shape[1] >= 8 and 'bhagavad' in file_path.name.lower():
                # Bhagavad Gita format
                df = df.iloc[:, 1:8].copy()
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
                # Generic CSV format - use first text column as content
                text_columns = []
                for col in df.columns:
                    if df[col].dtype == 'object':
                        sample = df[col].dropna().head(3).str.len()
                        if len(sample) > 0 and sample.mean() > 10:  # Likely text content
                            text_columns.append(col)

                if text_columns:
                    df = df[text_columns].copy()
                    df.columns = [f"text_{i+1}" for i in range(len(text_columns))]

            # Clean all text columns
            for col in df.columns:
                df[col] = df[col].apply(self.clean_text)

            # Add metadata
            df['source_file'] = file_path.name
            df['file_type'] = 'csv'

            log.info(f"Loaded {len(df)} rows from {file_path.name}")
            return df

        except Exception as e:
            log.error(f"Error loading CSV {file_path}: {e}")
            return pd.DataFrame()

    def load_pdf_file(self, file_path: Path) -> pd.DataFrame:
        """Load and process PDF file."""
        try:
            log.info(f"Loading PDF: {file_path}")

            doc = fitz.open(file_path)
            texts = []

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text()

                if text.strip():
                    # Split into paragraphs/sentences
                    paragraphs = re.split(r'\n\s*\n', text)
                    for para in paragraphs:
                        para = self.clean_text(para)
                        if len(para) > 50:  # Only keep substantial paragraphs
                            texts.append({
                                'page_number': page_num + 1,
                                'content': para,
                                'source_file': file_path.name,
                                'file_type': 'pdf'
                            })

            doc.close()

            if texts:
                df = pd.DataFrame(texts)
                log.info(f"Loaded {len(df)} text segments from {file_path.name}")
                return df
            else:
                log.warning(f"No substantial text found in {file_path.name}")
                return pd.DataFrame()

        except Exception as e:
            log.error(f"Error loading PDF {file_path}: {e}")
            return pd.DataFrame()

    def load_excel_file(self, file_path: Path) -> pd.DataFrame:
        """Load and process Excel file."""
        try:
            log.info(f"Loading Excel: {file_path}")

            # Read all sheets
            all_sheets = pd.read_excel(file_path, sheet_name=None)

            combined_data = []
            for sheet_name, df_sheet in all_sheets.items():
                # Convert all columns to string
                df_sheet = df_sheet.astype(str)

                # Clean text columns
                for col in df_sheet.columns:
                    df_sheet[col] = df_sheet[col].apply(self.clean_text)

                # Add sheet info
                df_sheet['sheet_name'] = sheet_name
                df_sheet['source_file'] = file_path.name
                df_sheet['file_type'] = 'excel'

                combined_data.append(df_sheet)

            if combined_data:
                df = pd.concat(combined_data, ignore_index=True)
                log.info(f"Loaded {len(df)} rows from {file_path.name}")
                return df
            else:
                return pd.DataFrame()

        except Exception as e:
            log.error(f"Error loading Excel {file_path}: {e}")
            return pd.DataFrame()

    def load_all_data(self) -> pd.DataFrame:
        """Load all data from all supported files."""
        log.info("Starting comprehensive data loading from all files...")

        all_dataframes = []
        files = self.get_all_files()

        log.info(f"Found {len(files)} supported files: {[f.name for f in files]}")

        for file_path in files:
            try:
                if file_path.suffix.lower() == '.csv':
                    df = self.load_csv_file(file_path)
                elif file_path.suffix.lower() == '.pdf':
                    df = self.load_pdf_file(file_path)
                elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                    df = self.load_excel_file(file_path)
                else:
                    continue

                if not df.empty:
                    all_dataframes.append(df)

            except Exception as e:
                log.error(f"Failed to load {file_path}: {e}")
                continue

        if not all_dataframes:
            raise ValueError("No data could be loaded from any files")

        # Combine all dataframes
        combined_df = pd.concat(all_dataframes, ignore_index=True)

        # Create unified content column
        combined_df = self.create_unified_content(combined_df)

        # Add unique ID
        combined_df['id'] = range(len(combined_df))

        self.df = combined_df
        log.info(f"Successfully loaded {len(combined_df)} total text segments from {len(all_dataframes)} files")
        return combined_df

    def create_unified_content(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create unified content columns for different file types."""
        # Initialize content columns
        df['content'] = ""
        df['title'] = ""
        df['language'] = "english"  # Default

        for idx, row in df.iterrows():
            content_parts = []

            # Handle different file types
            if row['file_type'] == 'csv':
                # For Bhagavad Gita CSV
                if 'combined_en' in df.columns and pd.notna(row.get('combined_en', '')):
                    content_parts.append(str(row['combined_en']))
                    df.at[idx, 'language'] = 'english'
                if 'combined_hi' in df.columns and pd.notna(row.get('combined_hi', '')):
                    content_parts.append(str(row['combined_hi']))
                    df.at[idx, 'language'] = 'hindi'
                if 'combined_sa' in df.columns and pd.notna(row.get('combined_sa', '')):
                    content_parts.append(str(row['combined_sa']))
                    df.at[idx, 'language'] = 'sanskrit'

                # For other CSVs, use text columns
                for col in df.columns:
                    if col.startswith('text_') and pd.notna(row.get(col, '')):
                        content_parts.append(str(row[col]))

                # Set title
                if pd.notna(row.get('verse_number', '')):
                    df.at[idx, 'title'] = f"Verse {row['verse_number']}"

            elif row['file_type'] == 'pdf':
                content_parts.append(str(row.get('content', '')))
                df.at[idx, 'title'] = f"Page {row.get('page_number', 'Unknown')}"

            elif row['file_type'] == 'excel':
                # Combine all non-metadata columns
                for col in df.columns:
                    if col not in ['source_file', 'file_type', 'sheet_name', 'title', 'language', 'content']:
                        if pd.notna(row.get(col, '')):
                            content_parts.append(str(row[col]))
                df.at[idx, 'title'] = f"Sheet: {row.get('sheet_name', 'Unknown')}"

            # Combine content
            df.at[idx, 'content'] = ' '.join(content_parts).strip()

            # Detect language if not set
            if df.at[idx, 'language'] == 'english':
                content = df.at[idx, 'content']
                if any(ord(char) > 127 for char in content):  # Contains non-ASCII
                    if any('\u0900' <= char <= '\u097F' for char in content):  # Devanagari
                        df.at[idx, 'language'] = 'hindi'
                    elif any('\u0980' <= char <= '\u09FF' for char in content):  # Bengali
                        df.at[idx, 'language'] = 'bengali'
                    else:
                        df.at[idx, 'language'] = 'sanskrit'  # Assume Sanskrit for other Indic scripts

        return df

    def load(self) -> pd.DataFrame:
        """Load all data (backwards compatibility)."""
        return self.load_all_data()

    def get_dataframe(self) -> pd.DataFrame:
        """Get loaded dataframe."""
        if self.df is None:
            return self.load_all_data()
        return self.df


# Backwards compatibility
class DataLoader(ComprehensiveDataLoader):
    """Backwards compatible DataLoader."""
    def __init__(self, data_path: str):
        # If data_path is a file, use its parent directory
        path = Path(data_path)
        if path.is_file():
            super().__init__(str(path.parent))
            self.specific_file = path
        else:
            super().__init__(data_path)
            self.specific_file = None

    def load(self) -> pd.DataFrame:
        """Load data (backwards compatible)."""
        if self.specific_file:
            # Load specific file for backwards compatibility
            if self.specific_file.suffix.lower() == '.csv':
                return self.load_csv_file(self.specific_file)
            else:
                return self.load_all_data()
        else:
            return self.load_all_data()
