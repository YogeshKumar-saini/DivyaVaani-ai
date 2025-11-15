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
        results['collections'] = self.check_collections()
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
    
    def check_collections(self) -> HealthCheckResult:
        """Check collection health.
        
        Returns:
            HealthCheckResult for collections
        """
        try:
            if not self.artifact_dir.exists():
                return HealthCheckResult(
                    component="collections",
                    status=HealthStatus.UNKNOWN,
                    message="Artifact directory not found"
                )
            
            # Count collections
            collections = [d for d in self.artifact_dir.iterdir() if d.is_dir()]
            
            if not collections:
                return HealthCheckResult(
                    component="collections",
                    status=HealthStatus.DEGRADED,
                    message="No collections found",
                    details={'count': 0}
                )
            
            # Check for collection manifests
            valid_collections = 0
            for coll_dir in collections:
                manifest = coll_dir / "collection_manifest.json"
                if manifest.exists():
                    valid_collections += 1
            
            if valid_collections == 0:
                return HealthCheckResult(
                    component="collections",
                    status=HealthStatus.DEGRADED,
                    message="No valid collections found",
                    details={'total': len(collections), 'valid': 0}
                )
            
            return HealthCheckResult(
                component="collections",
                status=HealthStatus.HEALTHY,
                message=f"{valid_collections} valid collections",
                details={'total': len(collections), 'valid': valid_collections}
            )
            
        except Exception as e:
            return HealthCheckResult(
                component="collections",
                status=HealthStatus.UNKNOWN,
                message=f"Error checking collections: {str(e)}"
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

            # Check for required artifacts in the root artifacts directory
            required_artifacts = ['embeddings.npy', 'faiss.index', 'bm25.pkl', 'verses.parquet']

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
