"""Advanced code processing and syntax-aware embeddings for multiple programming languages."""

import re
import ast
import json
from typing import List, Dict, Any, Optional, Set, Tuple
from pathlib import Path
import subprocess
import tempfile
from dataclasses import dataclass
from src.utils.logger import log


@dataclass
class CodeStructure:
    """Structured representation of code."""
    language: str
    functions: List[Dict[str, Any]]
    classes: List[Dict[str, Any]]
    imports: List[str]
    variables: List[str]
    comments: List[str]
    complexity_score: float
    quality_score: float
    metadata: Dict[str, Any]


@dataclass
class CodeAnalysis:
    """Analysis results for code."""
    structure: CodeStructure
    syntax_valid: bool
    dependencies: List[str]
    security_issues: List[str]
    performance_notes: List[str]
    documentation_score: float


class CodeProcessor:
    """Advanced processor for code files with syntax-aware analysis."""

    # Supported languages and their parsers
    SUPPORTED_LANGUAGES = {
        'python': {'extensions': ['.py'], 'parser': 'ast'},
        'javascript': {'extensions': ['.js', '.jsx', '.ts', '.tsx'], 'parser': 'esprima'},
        'java': {'extensions': ['.java'], 'parser': 'javalang'},
        'cpp': {'extensions': ['.cpp', '.cc', '.cxx', '.c++', '.hpp', '.h'], 'parser': 'clang'},
        'csharp': {'extensions': ['.cs'], 'parser': 'roslyn'},
        'go': {'extensions': ['.go'], 'parser': 'go/ast'},
        'rust': {'extensions': ['.rs'], 'parser': 'syn'},
        'php': {'extensions': ['.php'], 'parser': 'php-parser'},
        'ruby': {'extensions': ['.rb'], 'parser': 'ripper'},
        'sql': {'extensions': ['.sql'], 'parser': 'sqlparse'},
        'html': {'extensions': ['.html', '.htm'], 'parser': 'beautifulsoup'},
        'css': {'extensions': ['.css'], 'parser': 'cssutils'},
        'yaml': {'extensions': ['.yaml', '.yml'], 'parser': 'pyyaml'},
        'json': {'extensions': ['.json'], 'parser': 'json'},
        'xml': {'extensions': ['.xml'], 'parser': 'lxml'},
        'markdown': {'extensions': ['.md', '.markdown'], 'parser': 'markdown'},
        'shell': {'extensions': ['.sh', '.bash'], 'parser': 'bashlex'},
        'dockerfile': {'extensions': ['Dockerfile'], 'parser': 'dockerfile'},
        'makefile': {'extensions': ['Makefile', 'makefile'], 'parser': 'makefile'},
    }

    def __init__(self):
        self.language_patterns = self._initialize_patterns()

    def _initialize_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize regex patterns for different languages."""
        return {
            'python': {
                'function': re.compile(r'def\s+(\w+)\s*\([^)]*\)\s*:'),
                'class': re.compile(r'class\s+(\w+)[\s\(:]'),
                'import': re.compile(r'^(?:from\s+[\w.]+\s+)?import\s+.+'),
                'comment': re.compile(r'#.*'),
                'variable': re.compile(r'^\s*(\w+)\s*=\s*[^=]'),
                'string': re.compile(r'(\'\'\'|"""|\'|")(.*?)\1', re.DOTALL),
            },
            'javascript': {
                'function': re.compile(r'(?:function\s+(\w+)|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>|(\w+)\s*\([^)]*\)\s*{)'),
                'class': re.compile(r'class\s+(\w+)'),
                'import': re.compile(r'import\s+.+'),
                'comment': re.compile(r'(//.*|/\*.*?\*/)', re.DOTALL),
                'variable': re.compile(r'(?:const|let|var)\s+(\w+)\s*='),
            },
            'java': {
                'function': re.compile(r'(?:public|private|protected)?\s*\w+\s+(\w+)\s*\([^)]*\)\s*{'),
                'class': re.compile(r'class\s+(\w+)'),
                'import': re.compile(r'import\s+.+'),
                'comment': re.compile(r'(//.*|/\*.*?\*/)', re.DOTALL),
                'variable': re.compile(r'(?:int|String|double|boolean|float|char|long|short|byte)\s+(\w+)\s*[;=]'),
            },
            'cpp': {
                'function': re.compile(r'(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*{'),
                'class': re.compile(r'class\s+(\w+)'),
                'include': re.compile(r'#include\s+[<"].*[>"]'),
                'comment': re.compile(r'(//.*|/\*.*?\*/)', re.DOTALL),
                'variable': re.compile(r'(?:int|char|float|double|bool|string)\s+(\w+)\s*[;=]'),
            },
        }

    def detect_language(self, file_path: Path) -> Optional[str]:
        """Detect programming language from file extension."""
        extension = file_path.suffix.lower()
        for lang, config in self.SUPPORTED_LANGUAGES.items():
            if extension in config['extensions']:
                return lang
        return None

    def process_code_file(self, file_path: Path, content: Optional[str] = None) -> CodeAnalysis:
        """Process a code file and return analysis.

        Args:
            file_path: Path to the code file
            content: Optional content string (if not reading from file)

        Returns:
            CodeAnalysis object
        """
        try:
            # Read content if not provided
            if content is None:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

            # Detect language
            language = self.detect_language(file_path)
            if not language:
                language = 'unknown'

            # Parse code structure
            structure = self._parse_code_structure(content, language)

            # Validate syntax
            syntax_valid = self._validate_syntax(content, language)

            # Analyze dependencies
            dependencies = self._extract_dependencies(content, language)

            # Security analysis
            security_issues = self._analyze_security(content, language)

            # Performance analysis
            performance_notes = self._analyze_performance(content, language)

            # Documentation score
            documentation_score = self._calculate_documentation_score(content, language)

            return CodeAnalysis(
                structure=structure,
                syntax_valid=syntax_valid,
                dependencies=dependencies,
                security_issues=security_issues,
                performance_notes=performance_notes,
                documentation_score=documentation_score
            )

        except Exception as e:
            log.error(f"Error processing code file {file_path}: {str(e)}")
            return self._create_fallback_analysis(file_path)

    def _parse_code_structure(self, content: str, language: str) -> CodeStructure:
        """Parse code structure based on language."""
        try:
            if language == 'python':
                return self._parse_python_code(content)
            elif language == 'javascript':
                return self._parse_javascript_code(content)
            elif language == 'java':
                return self._parse_java_code(content)
            else:
                return self._parse_generic_code(content, language)
        except Exception as e:
            log.warning(f"Failed to parse {language} code: {str(e)}")
            return self._parse_generic_code(content, language)

    def _parse_python_code(self, content: str) -> CodeStructure:
        """Parse Python code using AST."""
        try:
            tree = ast.parse(content)

            functions = []
            classes = []
            imports = []
            variables = []

            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    functions.append({
                        'name': node.name,
                        'line': node.lineno,
                        'args': [arg.arg for arg in node.args.args],
                        'docstring': ast.get_docstring(node) or '',
                        'complexity': self._calculate_cyclomatic_complexity(node)
                    })
                elif isinstance(node, ast.ClassDef):
                    classes.append({
                        'name': node.name,
                        'line': node.lineno,
                        'bases': [base.id if hasattr(base, 'id') else str(base) for base in node.bases],
                        'docstring': ast.get_docstring(node) or '',
                        'methods': len([n for n in node.body if isinstance(n, ast.FunctionDef)])
                    })
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    if isinstance(node, ast.Import):
                        imports.extend([alias.name for alias in node.names])
                    else:
                        imports.extend([f"{node.module}.{alias.name}" if node.module else alias.name
                                      for alias in node.names])
                elif isinstance(node, ast.Assign):
                    for target in node.targets:
                        if hasattr(target, 'id'):
                            variables.append(target.id)

            # Extract comments
            comments = re.findall(r'#.*', content)

            # Calculate complexity and quality
            complexity_score = self._calculate_overall_complexity(functions)
            quality_score = self._calculate_code_quality(content, functions, classes)

            return CodeStructure(
                language='python',
                functions=functions,
                classes=classes,
                imports=imports,
                variables=variables,
                comments=comments,
                complexity_score=complexity_score,
                quality_score=quality_score,
                metadata={
                    'total_lines': len(content.split('\n')),
                    'ast_nodes': len(list(ast.walk(tree))),
                    'has_main': '__main__' in content or 'if __name__ == "__main__":' in content
                }
            )

        except SyntaxError:
            log.warning("Python syntax error, falling back to regex parsing")
            return self._parse_generic_code(content, 'python')

    def _parse_javascript_code(self, content: str) -> CodeStructure:
        """Parse JavaScript/TypeScript code."""
        patterns = self.language_patterns.get('javascript', {})

        functions = []
        classes = []
        imports = []
        variables = []
        comments = []

        # Extract functions
        for match in patterns['function'].finditer(content):
            func_name = match.group(1) or match.group(2) or match.group(3)
            if func_name:
                functions.append({
                    'name': func_name,
                    'line': content[:match.start()].count('\n') + 1,
                    'args': [],  # Would need more sophisticated parsing
                    'docstring': '',
                    'complexity': 1  # Simplified
                })

        # Extract classes
        for match in patterns['class'].finditer(content):
            classes.append({
                'name': match.group(1),
                'line': content[:match.start()].count('\n') + 1,
                'bases': [],
                'docstring': '',
                'methods': 0
            })

        # Extract imports and variables
        imports = patterns['import'].findall(content)
        variables = [match.group(1) for match in patterns['variable'].finditer(content)]
        comments = patterns['comment'].findall(content)

        return CodeStructure(
            language='javascript',
            functions=functions,
            classes=classes,
            imports=imports,
            variables=variables,
            comments=comments,
            complexity_score=self._calculate_overall_complexity(functions),
            quality_score=self._calculate_code_quality(content, functions, classes),
            metadata={'total_lines': len(content.split('\n'))}
        )

    def _parse_java_code(self, content: str) -> CodeStructure:
        """Parse Java code."""
        patterns = self.language_patterns.get('java', {})

        functions = []
        classes = []
        imports = []
        variables = []
        comments = []

        # Extract functions
        for match in patterns['function'].finditer(content):
            functions.append({
                'name': match.group(2),
                'line': content[:match.start()].count('\n') + 1,
                'args': [],
                'docstring': '',
                'complexity': 1
            })

        # Extract classes
        for match in patterns['class'].finditer(content):
            classes.append({
                'name': match.group(1),
                'line': content[:match.start()].count('\n') + 1,
                'bases': [],
                'docstring': '',
                'methods': 0
            })

        # Extract imports and variables
        imports = patterns['import'].findall(content)
        variables = [match.group(1) for match in patterns['variable'].finditer(content)]
        comments = patterns['comment'].findall(content)

        return CodeStructure(
            language='java',
            functions=functions,
            classes=classes,
            imports=imports,
            variables=variables,
            comments=comments,
            complexity_score=self._calculate_overall_complexity(functions),
            quality_score=self._calculate_code_quality(content, functions, classes),
            metadata={'total_lines': len(content.split('\n'))}
        )

    def _parse_generic_code(self, content: str, language: str) -> CodeStructure:
        """Generic code parsing using regex patterns."""
        patterns = self.language_patterns.get(language, {})

        functions = []
        classes = []
        imports = []
        variables = []
        comments = []

        # Try to extract using available patterns
        if 'function' in patterns:
            functions = [{'name': match.group(1), 'line': content[:match.start()].count('\n') + 1,
                         'args': [], 'docstring': '', 'complexity': 1}
                        for match in patterns['function'].finditer(content)]

        if 'class' in patterns:
            classes = [{'name': match.group(1), 'line': content[:match.start()].count('\n') + 1,
                       'bases': [], 'docstring': '', 'methods': 0}
                      for match in patterns['class'].finditer(content)]

        # Extract comments
        if 'comment' in patterns:
            comments = patterns['comment'].findall(content)

        return CodeStructure(
            language=language,
            functions=functions,
            classes=classes,
            imports=imports,
            variables=variables,
            comments=comments,
            complexity_score=self._calculate_overall_complexity(functions),
            quality_score=0.5,  # Neutral score for unknown languages
            metadata={'total_lines': len(content.split('\n'))}
        )

    def _calculate_cyclomatic_complexity(self, node: ast.AST) -> int:
        """Calculate cyclomatic complexity for a function."""
        complexity = 1  # Base complexity

        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.With)):
                complexity += 1
            elif isinstance(child, ast.BoolOp) and isinstance(child.op, (ast.And, ast.Or)):
                complexity += len(child.values) - 1
            elif isinstance(child, ast.Try):
                complexity += len(child.handlers) + 1

        return complexity

    def _calculate_overall_complexity(self, functions: List[Dict]) -> float:
        """Calculate overall code complexity."""
        if not functions:
            return 0.0

        complexities = [f.get('complexity', 1) for f in functions]
        avg_complexity = sum(complexities) / len(complexities)

        # Normalize to 0-1 scale (assuming 1-10 is normal range)
        return min(1.0, avg_complexity / 10.0)

    def _calculate_code_quality(self, content: str, functions: List[Dict],
                              classes: List[Dict]) -> float:
        """Calculate code quality score."""
        score = 0.5  # Base score

        # Factor in documentation
        documented_functions = sum(1 for f in functions if f.get('docstring', '').strip())
        if functions:
            doc_ratio = documented_functions / len(functions)
            score += doc_ratio * 0.2

        # Factor in code length (prefer moderate length functions)
        if functions:
            avg_length = len(content) / len(functions)
            if 50 <= avg_length <= 500:  # Sweet spot
                score += 0.2
            elif avg_length > 1000:  # Too long
                score -= 0.1

        # Factor in structure
        if classes:
            score += 0.1

        return max(0.0, min(1.0, score))

    def _validate_syntax(self, content: str, language: str) -> bool:
        """Validate syntax for the given language."""
        try:
            if language == 'python':
                ast.parse(content)
                return True
            elif language == 'json':
                json.loads(content)
                return True
            elif language == 'yaml':
                import yaml
                yaml.safe_load(content)
                return True
            else:
                # For other languages, try basic validation
                return self._basic_syntax_check(content, language)
        except:
            return False

    def _basic_syntax_check(self, content: str, language: str) -> bool:
        """Basic syntax validation."""
        # Check for balanced brackets
        brackets = {'(': ')', '[': ']', '{': '}'}
        stack = []

        for char in content:
            if char in brackets:
                stack.append(char)
            elif char in brackets.values():
                if not stack or brackets[stack.pop()] != char:
                    return False

        return len(stack) == 0

    def _extract_dependencies(self, content: str, language: str) -> List[str]:
        """Extract dependencies from code."""
        dependencies = []

        if language == 'python':
            # Extract imports
            import_matches = re.findall(r'^(?:from\s+([\w.]+)\s+)?import\s+([\w.,\s]+)', content, re.MULTILINE)
            for from_mod, imports in import_matches:
                if from_mod:
                    dependencies.append(from_mod)
                if imports:
                    deps = [imp.strip() for imp in imports.split(',')]
                    dependencies.extend(deps)

        elif language == 'javascript':
            # Extract imports
            import_matches = re.findall(r'import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]', content)
            dependencies.extend(import_matches)

        elif language == 'java':
            # Extract imports
            import_matches = re.findall(r'import\s+([^;]+);', content)
            dependencies.extend(import_matches)

        return list(set(dependencies))  # Remove duplicates

    def _analyze_security(self, content: str, language: str) -> List[str]:
        """Analyze code for security issues."""
        issues = []

        if language == 'python':
            # Check for dangerous patterns
            if 'eval(' in content:
                issues.append("Use of eval() function - potential security risk")
            if 'exec(' in content:
                issues.append("Use of exec() function - potential security risk")
            if 'subprocess.call' in content and 'shell=True' in content:
                issues.append("Shell execution with shell=True - potential command injection")

        elif language == 'javascript':
            # Check for dangerous patterns
            if 'eval(' in content:
                issues.append("Use of eval() function - potential security risk")
            if 'innerHTML' in content and '=' in content:
                issues.append("Direct innerHTML assignment - potential XSS vulnerability")

        return issues

    def _analyze_performance(self, content: str, language: str) -> List[str]:
        """Analyze code for performance issues."""
        notes = []

        if language == 'python':
            # Check for potential performance issues
            if re.search(r'for\s+\w+\s+in\s+range\(len\(', content):
                notes.append("Consider using enumerate() instead of range(len())")
            if 'global' in content:
                notes.append("Use of global variables - may impact performance")

        return notes

    def _calculate_documentation_score(self, content: str, language: str) -> float:
        """Calculate documentation score."""
        if language == 'python':
            # Count docstrings
            docstring_count = len(re.findall(r'""".*?"""', content, re.DOTALL))
            function_count = len(re.findall(r'def\s+\w+', content))

            if function_count == 0:
                return 1.0 if docstring_count > 0 else 0.0

            return min(1.0, docstring_count / function_count)

        # Default scoring for other languages
        comment_lines = len([line for line in content.split('\n') if line.strip().startswith(('#', '//', '/*'))])
        total_lines = len(content.split('\n'))

        return min(1.0, comment_lines / max(1, total_lines) * 3)  # 30% comments is good

    def _create_fallback_analysis(self, file_path: Path) -> CodeAnalysis:
        """Create fallback analysis for processing failures."""
        return CodeAnalysis(
            structure=CodeStructure(
                language='unknown',
                functions=[],
                classes=[],
                imports=[],
                variables=[],
                comments=[],
                complexity_score=0.0,
                quality_score=0.0,
                metadata={'error': f'Failed to process {file_path}'}
            ),
            syntax_valid=False,
            dependencies=[],
            security_issues=[],
            performance_notes=[],
            documentation_score=0.0
        )

    def generate_code_embedding(self, analysis: CodeAnalysis) -> str:
        """Generate rich text representation for code embedding."""
        structure = analysis.structure

        representations = [
            f"Language: {structure.language}",
            f"Complexity Score: {structure.complexity_score:.2f}",
            f"Quality Score: {structure.quality_score:.2f}",
            f"Documentation Score: {analysis.documentation_score:.2f}",
            f"Functions: {len(structure.functions)}",
            f"Classes: {len(structure.classes)}",
            f"Imports: {', '.join(structure.imports[:5])}",  # First 5 imports
        ]

        # Add function details
        if structure.functions:
            func_names = [f['name'] for f in structure.functions[:3]]  # First 3 functions
            representations.append(f"Function Names: {', '.join(func_names)}")

        # Add class details
        if structure.classes:
            class_names = [c['name'] for c in structure.classes[:3]]  # First 3 classes
            representations.append(f"Class Names: {', '.join(class_names)}")

        # Add metadata
        for key, value in structure.metadata.items():
            if isinstance(value, (str, int, float)):
                representations.append(f"{key.replace('_', ' ').title()}: {value}")

        # Add issues if any
        if analysis.security_issues:
            representations.append(f"Security Issues: {len(analysis.security_issues)}")
        if analysis.performance_notes:
            representations.append(f"Performance Notes: {len(analysis.performance_notes)}")

        return " | ".join(representations)
