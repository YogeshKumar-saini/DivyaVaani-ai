"""Health check system for monitoring component status."""

from pathlib import Path
from typing import Dict, List
from dataclasses import dataclass
from enum import Enum
from src.utils.logger import log


class HealthStatus(str, Enum):
    """Health status values."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


@dataclass
class HealthCheckResult:
    """Result of a health check."""
    component: str
    status: HealthStatus
    message: str
    details: Dict = None


class HealthCheck:
    """Health check system for monitoring components."""
    
    def __init__(self, artifact_dir: Path):
        """Initialize health check system.
        
        Args:
            artifact_dir: Base directory for artifacts
        """
        self.artifact_dir = Path(artifact_dir)
    
    def check_all(self) -> Dict[str, HealthCheckResult]:
        """Run all health checks.
        
        Returns:
            Dictionary of component names to health check results
        """
        results = {}
        
        results['storage'] = self.check_storage()
        results['pinecone'] = self.check_pinecone()
        results['artifacts'] = self.check_artifacts()
        
        return results
    
    def check_storage(self) -> HealthCheckResult:
        """Check storage system health.
        
        Returns:
            HealthCheckResult for storage
        """
        try:
            # Check if artifact directory exists and is writable
            if not self.artifact_dir.exists():
                return HealthCheckResult(
                    component="storage",
                    status=HealthStatus.UNHEALTHY,
                    message="Artifact directory does not exist"
                )
            
            # Try to create a test file
            test_file = self.artifact_dir / ".health_check"
            try:
                test_file.touch()
                test_file.unlink()
            except Exception as e:
                return HealthCheckResult(
                    component="storage",
                    status=HealthStatus.UNHEALTHY,
                    message=f"Storage not writable: {str(e)}"
                )
            
            # Check disk space
            import shutil
            stats = shutil.disk_usage(self.artifact_dir)
            free_gb = stats.free / (1024 ** 3)
            
            if free_gb < 1:
                return HealthCheckResult(
                    component="storage",
                    status=HealthStatus.DEGRADED,
                    message=f"Low disk space: {free_gb:.2f} GB free",
                    details={'free_gb': free_gb}
                )
            
            return HealthCheckResult(
                component="storage",
                status=HealthStatus.HEALTHY,
                message=f"Storage healthy, {free_gb:.2f} GB free",
                details={'free_gb': free_gb}
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="storage",
                status=HealthStatus.UNKNOWN,
                message=f"Error checking storage: {str(e)}"
            )
    
    def check_pinecone(self) -> HealthCheckResult:
        """Check Pinecone index health.
        
        Returns:
            HealthCheckResult for Pinecone
        """
        try:
            from pinecone import Pinecone
            import os
            
            api_key = os.getenv('PINECONE_API_KEY')
            if not api_key:
                return HealthCheckResult(
                    component="pinecone",
                    status=HealthStatus.UNHEALTHY,
                    message="Pinecone API key not found in environment"
                )
            
            pc = Pinecone(api_key=api_key)
            index_name = "divyavaani-verses"
            
            # Check if index exists
            if index_name not in pc.list_indexes().names():
                return HealthCheckResult(
                    component="pinecone",
                    status=HealthStatus.UNHEALTHY,
                    message=f"Index '{index_name}' not found"
                )
            
            # Check index stats
            index = pc.Index(index_name)
            stats = index.describe_index_stats()
            
            return HealthCheckResult(
                component="pinecone",
                status=HealthStatus.HEALTHY,
                message=f"Pinecone healthy, {stats.total_vector_count} vectors",
                details={
                    'total_vectors': stats.total_vector_count,
                    'dimension': stats.dimension
                }
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="pinecone",
                status=HealthStatus.UNKNOWN,
                message=f"Error checking Pinecone: {str(e)}"
            )

    def check_artifacts(self) -> HealthCheckResult:
        """Check artifact health.

        Returns:
            HealthCheckResult for artifacts
        """
        try:
            if not self.artifact_dir.exists():
                return HealthCheckResult(
                    component="artifacts",
                    status=HealthStatus.UNKNOWN,
                    message="Artifact directory not found"
                )

            # Check for required artifacts - only embeddings and data needed for reference
            # Pinecone holds the actual vectors
            required_artifacts = ['embeddings.npy', 'verses.parquet']

            artifacts_found = sum(1 for art in required_artifacts if (self.artifact_dir / art).exists())

            if artifacts_found == len(required_artifacts):
                return HealthCheckResult(
                    component="artifacts",
                    status=HealthStatus.HEALTHY,
                    message="All required artifacts present",
                    details={'found': artifacts_found, 'required': len(required_artifacts)}
                )
            elif artifacts_found > 0:
                return HealthCheckResult(
                    component="artifacts",
                    status=HealthStatus.DEGRADED,
                    message=f"Some artifacts missing: {artifacts_found}/{len(required_artifacts)} found",
                    details={'found': artifacts_found, 'required': len(required_artifacts), 'missing': len(required_artifacts) - artifacts_found}
                )
            else:
                return HealthCheckResult(
                    component="artifacts",
                    status=HealthStatus.UNHEALTHY,
                    message="No artifacts found",
                    details={'found': 0, 'required': len(required_artifacts)}
                )

        except Exception as e:
            return HealthCheckResult(
                component="artifacts",
                status=HealthStatus.UNKNOWN,
                message=f"Error checking artifacts: {str(e)}"
            )
    
    def get_overall_status(self, results: Dict[str, HealthCheckResult]) -> HealthStatus:
        """Get overall system health status.

        Args:
            results: Dictionary of health check results

        Returns:
            Overall HealthStatus
        """
        statuses = [r.status for r in results.values()]

        if HealthStatus.UNHEALTHY in statuses:
            return HealthStatus.UNHEALTHY
        elif HealthStatus.DEGRADED in statuses:
            return HealthStatus.DEGRADED
        elif HealthStatus.UNKNOWN in statuses:
            return HealthStatus.UNKNOWN
        else:
            return HealthStatus.HEALTHY


# Initialize health checker instance lazily to avoid circular imports
_health_checker = None

def get_health_checker():
    """Get the health checker instance."""
    global _health_checker
    if _health_checker is None:
        from src.config import settings
        _health_checker = HealthCheck(settings.artifact_path)
    return _health_checker

# For backward compatibility - this will be set after config is loaded
health_checker = None
