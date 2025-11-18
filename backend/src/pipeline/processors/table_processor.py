"""Advanced table processing and understanding for complex tabular data."""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple, Union
from pathlib import Path
import re
from dataclasses import dataclass
from src.utils.logger import log


@dataclass
class TableStructure:
    """Advanced table structure representation."""
    headers: List[List[str]]  # Multi-level headers
    data_rows: List[List[Any]]
    merged_cells: List[Dict[str, Any]]
    data_types: List[str]
    relationships: Dict[str, Any]
    metadata: Dict[str, Any]


@dataclass
class TableAnalysis:
    """Analysis results for a table."""
    structure: TableStructure
    quality_score: float
    complexity_score: float
    semantic_type: str  # 'data_table', 'summary_table', 'comparison_table', etc.
    key_columns: List[str]
    summary_stats: Dict[str, Any]


class AdvancedTableProcessor:
    """Advanced processor for complex table structures and understanding."""

    def __init__(self):
        self.numeric_patterns = [
            re.compile(r'^\d+\.?\d*$'),  # Integers and decimals
            re.compile(r'^\d{1,2}/\d{1,2}/\d{2,4}$'),  # Dates
            re.compile(r'^\$?\d+(?:,\d{3})*(?:\.\d{2})?$'),  # Currency
            re.compile(r'^\d+(?:\.\d+)?%?$'),  # Percentages
        ]

    def process_table(self, table_data: Union[List[List], pd.DataFrame],
                     metadata: Optional[Dict[str, Any]] = None) -> TableAnalysis:
        """Process and analyze a complex table.

        Args:
            table_data: Raw table data (list of lists or DataFrame)
            metadata: Additional metadata about the table

        Returns:
            TableAnalysis with structure and insights
        """
        try:
            # Convert to DataFrame if needed
            if isinstance(table_data, list):
                df = pd.DataFrame(table_data)
            else:
                df = table_data.copy()

            # Clean and preprocess
            df = self._clean_table_data(df)

            # Analyze structure
            structure = self._analyze_table_structure(df)

            # Detect data types
            data_types = self._infer_column_types(df)

            # Find merged cells and complex headers
            merged_cells = self._detect_merged_cells(df)
            multi_level_headers = self._extract_multi_level_headers(df)

            # Analyze relationships
            relationships = self._analyze_relationships(df, data_types)

            # Calculate quality and complexity
            quality_score = self._calculate_quality_score(df, structure)
            complexity_score = self._calculate_complexity_score(structure, merged_cells)

            # Determine semantic type
            semantic_type = self._classify_table_type(df, structure, relationships)

            # Identify key columns
            key_columns = self._identify_key_columns(df, data_types, relationships)

            # Generate summary statistics
            summary_stats = self._generate_summary_stats(df, data_types)

            # Update structure with analysis results
            structure.data_types = data_types
            structure.relationships = relationships
            structure.metadata.update({
                'quality_score': quality_score,
                'complexity_score': complexity_score,
                'semantic_type': semantic_type,
                'key_columns': key_columns,
                **summary_stats
            })

            return TableAnalysis(
                structure=structure,
                quality_score=quality_score,
                complexity_score=complexity_score,
                semantic_type=semantic_type,
                key_columns=key_columns,
                summary_stats=summary_stats
            )

        except Exception as e:
            log.error(f"Error processing table: {str(e)}")
            # Return minimal analysis for failed processing
            return self._create_fallback_analysis(table_data)

    def _clean_table_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and normalize table data.

        Args:
            df: Input DataFrame

        Returns:
            Cleaned DataFrame
        """
        # Remove completely empty rows and columns
        df = df.dropna(how='all').dropna(axis=1, how='all')

        # Fill NaN values appropriately
        for col in df.columns:
            if df[col].dtype == 'object':
                # For text columns, fill with empty string
                df[col] = df[col].fillna('')
            else:
                # For numeric columns, fill with 0 or mean
                if df[col].dtype in ['int64', 'float64']:
                    df[col] = df[col].fillna(0)
                else:
                    df[col] = df[col].fillna('')

        # Clean text data
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].astype(str).apply(self._clean_text_cell)

        return df

    def _clean_text_cell(self, text: str) -> str:
        """Clean individual text cells.

        Args:
            text: Raw text content

        Returns:
            Cleaned text
        """
        if not isinstance(text, str):
            return str(text)

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())

        # Remove non-printable characters
        text = re.sub(r'[^\x20-\x7E\n\r\t]', '', text)

        # Normalize quotes and dashes
        text = text.replace('"', '"').replace('"', '"')
        text = text.replace('–', '-').replace('—', '-')

        return text

    def _analyze_table_structure(self, df: pd.DataFrame) -> TableStructure:
        """Analyze the structural properties of the table.

        Args:
            df: Input DataFrame

        Returns:
            TableStructure object
        """
        # Extract headers (first row if not already set)
        headers = [list(df.columns)]

        # If columns are default integers, try to extract from first row
        if all(isinstance(col, int) for col in df.columns):
            first_row = df.iloc[0].tolist()
            if self._is_header_row(first_row, df):
                headers = [first_row]
                df = df.iloc[1:].reset_index(drop=True)
                df.columns = first_row

        # Extract data rows
        data_rows = df.values.tolist()

        # Initialize other components
        merged_cells = []
        relationships = {}
        metadata = {
            'shape': df.shape,
            'total_cells': df.shape[0] * df.shape[1],
            'empty_cells': df.isnull().sum().sum(),
            'unique_values': df.nunique().sum()
        }

        return TableStructure(
            headers=headers,
            data_rows=data_rows,
            merged_cells=merged_cells,
            data_types=[],
            relationships=relationships,
            metadata=metadata
        )

    def _is_header_row(self, row: List, df: pd.DataFrame) -> bool:
        """Determine if a row appears to be a header row.

        Args:
            row: Row to check
            df: DataFrame context

        Returns:
            True if row appears to be headers
        """
        if not row:
            return False

        # Check if row has mostly non-numeric content
        non_numeric = 0
        for cell in row:
            cell_str = str(cell).strip()
            if cell_str and not any(pattern.match(cell_str) for pattern in self.numeric_patterns):
                non_numeric += 1

        # If more than 70% non-numeric, likely headers
        return non_numeric / len(row) > 0.7 if row else False

    def _infer_column_types(self, df: pd.DataFrame) -> List[str]:
        """Infer data types for each column.

        Args:
            df: Input DataFrame

        Returns:
            List of inferred types
        """
        types = []

        for col in df.columns:
            col_data = df[col].dropna()

            if col_data.empty:
                types.append('empty')
                continue

            # Check for numeric types
            try:
                pd.to_numeric(col_data)
                # Check if it's integer or float
                if all(isinstance(x, int) or (isinstance(x, str) and '.' not in str(x)) for x in col_data):
                    types.append('integer')
                else:
                    types.append('numeric')
                continue
            except (ValueError, TypeError):
                pass

            # Check for date types
            try:
                pd.to_datetime(col_data, errors='coerce')
                if pd.to_datetime(col_data, errors='coerce').notna().sum() > len(col_data) * 0.8:
                    types.append('date')
                    continue
            except:
                pass

            # Check for categorical
            unique_ratio = col_data.nunique() / len(col_data)
            if unique_ratio < 0.1:  # Less than 10% unique values
                types.append('categorical')
            else:
                types.append('text')

        return types

    def _detect_merged_cells(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect merged cells in the table.

        Args:
            df: Input DataFrame

        Returns:
            List of merged cell descriptions
        """
        merged_cells = []

        # This is a simplified detection - in practice, you'd need
        # more sophisticated analysis of the original table structure

        # Look for repeated values that might indicate merged cells
        for col_idx, col in enumerate(df.columns):
            col_values = df[col].tolist()
            current_value = None
            start_idx = 0

            for row_idx, value in enumerate(col_values):
                if pd.isna(value):
                    continue

                if value == current_value:
                    continue
                else:
                    # Check if previous sequence was a merge
                    if current_value is not None and (row_idx - start_idx) > 1:
                        merged_cells.append({
                            'type': 'vertical_merge',
                            'column': col_idx,
                            'start_row': start_idx,
                            'end_row': row_idx - 1,
                            'value': current_value
                        })

                    current_value = value
                    start_idx = row_idx

            # Check final sequence
            if current_value is not None and (len(col_values) - start_idx) > 1:
                merged_cells.append({
                    'type': 'vertical_merge',
                    'column': col_idx,
                    'start_row': start_idx,
                    'end_row': len(col_values) - 1,
                    'value': current_value
                })

        return merged_cells

    def _extract_multi_level_headers(self, df: pd.DataFrame) -> List[List[str]]:
        """Extract multi-level headers if present.

        Args:
            df: Input DataFrame

        Returns:
            List of header levels
        """
        # This is a simplified implementation
        # In practice, you'd need more sophisticated header detection

        headers = [list(df.columns)]

        # Check if first few rows might be additional headers
        for i in range(min(3, len(df))):
            row = df.iloc[i]
            if self._is_header_row(row.tolist(), df):
                headers.append(row.tolist())

        return headers

    def _analyze_relationships(self, df: pd.DataFrame, data_types: List[str]) -> Dict[str, Any]:
        """Analyze relationships between columns.

        Args:
            df: Input DataFrame
            data_types: Inferred data types

        Returns:
            Relationship analysis
        """
        relationships = {
            'correlations': {},
            'hierarchies': [],
            'dependencies': []
        }

        # Calculate correlations for numeric columns
        numeric_cols = [col for col, dtype in zip(df.columns, data_types) if dtype in ['numeric', 'integer']]
        if len(numeric_cols) > 1:
            corr_matrix = df[numeric_cols].corr()
            relationships['correlations'] = corr_matrix.to_dict()

        # Detect hierarchical relationships
        for i, (col, dtype) in enumerate(zip(df.columns, data_types)):
            if dtype == 'categorical':
                unique_values = df[col].value_counts()
                if len(unique_values) < len(df) * 0.5:  # Not too many unique values
                    relationships['hierarchies'].append({
                        'column': col,
                        'unique_count': len(unique_values),
                        'distribution': unique_values.to_dict()
                    })

        return relationships

    def _calculate_quality_score(self, df: pd.DataFrame, structure: TableStructure) -> float:
        """Calculate table quality score.

        Args:
            df: Input DataFrame
            structure: Table structure

        Returns:
            Quality score (0-1)
        """
        score = 1.0

        # Penalize for empty cells
        empty_ratio = df.isnull().sum().sum() / (df.shape[0] * df.shape[1])
        score -= empty_ratio * 0.5

        # Penalize for duplicate rows
        duplicate_ratio = df.duplicated().sum() / len(df)
        score -= duplicate_ratio * 0.3

        # Bonus for clear headers
        if structure.headers and len(structure.headers[0]) > 0:
            score += 0.1

        # Bonus for consistent data types
        type_consistency = len(set(structure.data_types)) / len(structure.data_types) if structure.data_types else 0
        score += type_consistency * 0.1

        return max(0.0, min(1.0, score))

    def _calculate_complexity_score(self, structure: TableStructure, merged_cells: List) -> float:
        """Calculate table complexity score.

        Args:
            structure: Table structure
            merged_cells: Merged cell information

        Returns:
            Complexity score (0-1)
        """
        complexity = 0.0

        # Multi-level headers increase complexity
        if len(structure.headers) > 1:
            complexity += 0.3

        # Merged cells increase complexity
        if merged_cells:
            complexity += min(0.4, len(merged_cells) * 0.1)

        # Large tables are more complex
        size_score = min(0.3, (structure.metadata['total_cells'] / 1000) * 0.3)
        complexity += size_score

        return min(1.0, complexity)

    def _classify_table_type(self, df: pd.DataFrame, structure: TableStructure,
                           relationships: Dict) -> str:
        """Classify the semantic type of the table.

        Args:
            df: Input DataFrame
            structure: Table structure
            relationships: Relationship analysis

        Returns:
            Semantic table type
        """
        # Simple classification logic
        num_cols = len(df.columns)
        num_rows = len(df)

        # Check for summary/statistics tables
        if num_rows < 10 and any('total' in str(col).lower() for col in df.columns):
            return 'summary_table'

        # Check for comparison tables
        if num_cols > 5 and num_rows < 20:
            return 'comparison_table'

        # Check for time series
        date_cols = [col for col, dtype in zip(df.columns, structure.data_types) if dtype == 'date']
        if date_cols and num_rows > 10:
            return 'time_series_table'

        # Default to data table
        return 'data_table'

    def _identify_key_columns(self, df: pd.DataFrame, data_types: List[str],
                            relationships: Dict) -> List[str]:
        """Identify key columns in the table.

        Args:
            df: Input DataFrame
            data_types: Column data types
            relationships: Relationship analysis

        Returns:
            List of key column names
        """
        key_columns = []

        for col, dtype in zip(df.columns, data_types):
            # Primary keys are often categorical with few unique values
            if dtype == 'categorical':
                unique_ratio = df[col].nunique() / len(df)
                if unique_ratio < 0.5:  # Less than 50% unique
                    key_columns.append(col)

            # ID columns often contain sequential numbers
            elif dtype == 'integer':
                col_data = pd.to_numeric(df[col], errors='coerce').dropna()
                if len(col_data) > 5:
                    # Check if approximately sequential
                    diffs = col_data.diff().dropna()
                    if (diffs == 1).sum() > len(diffs) * 0.8:  # 80% sequential
                        key_columns.append(col)

        return key_columns

    def _generate_summary_stats(self, df: pd.DataFrame, data_types: List[str]) -> Dict[str, Any]:
        """Generate summary statistics for the table.

        Args:
            df: Input DataFrame
            data_types: Column data types

        Returns:
            Summary statistics
        """
        stats = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'column_types': dict(zip(df.columns, data_types))
        }

        # Numeric column statistics
        numeric_cols = [col for col, dtype in zip(df.columns, data_types) if dtype in ['numeric', 'integer']]
        if numeric_cols:
            numeric_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
            stats['numeric_summary'] = numeric_df.describe().to_dict()

        # Categorical column statistics
        cat_cols = [col for col, dtype in zip(df.columns, data_types) if dtype == 'categorical']
        if cat_cols:
            cat_stats = {}
            for col in cat_cols:
                value_counts = df[col].value_counts()
                cat_stats[col] = {
                    'unique_values': len(value_counts),
                    'top_value': value_counts.index[0] if len(value_counts) > 0 else None,
                    'top_count': value_counts.iloc[0] if len(value_counts) > 0 else 0
                }
            stats['categorical_summary'] = cat_stats

        return stats

    def _create_fallback_analysis(self, table_data: Any) -> TableAnalysis:
        """Create a fallback analysis for processing failures.

        Args:
            table_data: Original table data

        Returns:
            Minimal TableAnalysis
        """
        # Create minimal structure
        if isinstance(table_data, list) and table_data:
            shape = (len(table_data), len(table_data[0]) if table_data[0] else 0)
        else:
            shape = (0, 0)

        structure = TableStructure(
            headers=[[]],
            data_rows=[],
            merged_cells=[],
            data_types=[],
            relationships={},
            metadata={'shape': shape, 'fallback': True}
        )

        return TableAnalysis(
            structure=structure,
            quality_score=0.0,
            complexity_score=0.0,
            semantic_type='unknown',
            key_columns=[],
            summary_stats={'fallback': True}
        )

    def normalize_table(self, table_analysis: TableAnalysis) -> pd.DataFrame:
        """Normalize table based on analysis results.

        Args:
            table_analysis: TableAnalysis object

        Returns:
            Normalized DataFrame
        """
        # This would implement table normalization logic
        # For now, return a basic DataFrame
        df = pd.DataFrame(
            table_analysis.structure.data_rows,
            columns=table_analysis.structure.headers[0] if table_analysis.structure.headers else None
        )

        return df

    def generate_table_embedding(self, table_analysis: TableAnalysis) -> np.ndarray:
        """Generate semantic embedding for the table.

        Args:
            table_analysis: TableAnalysis object

        Returns:
            Table embedding vector
        """
        # This would generate a rich embedding based on table structure and content
        # For now, return a placeholder
        embedding_dim = 384  # Standard embedding dimension
        return np.random.rand(embedding_dim)  # Placeholder implementation
