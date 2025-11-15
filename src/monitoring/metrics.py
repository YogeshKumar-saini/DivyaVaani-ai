"""Metrics collection for pipeline monitoring."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Any
from enum import Enum
import time
import json
from pathlib import Path


class MetricType(str, Enum):
    """Type of metric."""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"


@dataclass
class Metric:
    """A single metric measurement."""
    name: str
    type: MetricType
    value: float
    timestamp: datetime = field(default_factory=datetime.now)
    labels: Dict[str, str] = field(default_factory=dict)


class MetricsCollector:
    """Collects and tracks metrics for pipeline execution."""
    
    def __init__(self):
        self.metrics: List[Metric] = []
        self.counters: Dict[str, float] = {}
        self.gauges: Dict[str, float] = {}
        self.histograms: Dict[str, List[float]] = {}
        self.timers: Dict[str, float] = {}
        self._timer_starts: Dict[str, float] = {}
    
    def increment_counter(self, name: str, value: float = 1.0, labels: Dict[str, str] = None) -> None:
        """Increment a counter metric.
        
        Args:
            name: Counter name
            value: Value to increment by
            labels: Optional labels for the metric
        """
        key = self._make_key(name, labels)
        self.counters[key] = self.counters.get(key, 0) + value
        
        self.metrics.append(Metric(
            name=name,
            type=MetricType.COUNTER,
            value=self.counters[key],
            labels=labels or {}
        ))
    
    def set_gauge(self, name: str, value: float, labels: Dict[str, str] = None) -> None:
        """Set a gauge metric.
        
        Args:
            name: Gauge name
            value: Current value
            labels: Optional labels for the metric
        """
        key = self._make_key(name, labels)
        self.gauges[key] = value
        
        self.metrics.append(Metric(
            name=name,
            type=MetricType.GAUGE,
            value=value,
            labels=labels or {}
        ))
    
    def record_histogram(self, name: str, value: float, labels: Dict[str, str] = None) -> None:
        """Record a value in a histogram.
        
        Args:
            name: Histogram name
            value: Value to record
            labels: Optional labels for the metric
        """
        key = self._make_key(name, labels)
        if key not in self.histograms:
            self.histograms[key] = []
        self.histograms[key].append(value)
        
        self.metrics.append(Metric(
            name=name,
            type=MetricType.HISTOGRAM,
            value=value,
            labels=labels or {}
        ))
    
    def start_timer(self, name: str, labels: Dict[str, str] = None) -> None:
        """Start a timer.
        
        Args:
            name: Timer name
            labels: Optional labels for the metric
        """
        key = self._make_key(name, labels)
        self._timer_starts[key] = time.time()
    
    def stop_timer(self, name: str, labels: Dict[str, str] = None) -> float:
        """Stop a timer and record the duration.
        
        Args:
            name: Timer name
            labels: Optional labels for the metric
            
        Returns:
            Duration in seconds
        """
        key = self._make_key(name, labels)
        if key not in self._timer_starts:
            return 0.0
        
        duration = time.time() - self._timer_starts[key]
        self.timers[key] = duration
        del self._timer_starts[key]
        
        self.metrics.append(Metric(
            name=name,
            type=MetricType.TIMER,
            value=duration,
            labels=labels or {}
        ))
        
        return duration
    
    def get_counter(self, name: str, labels: Dict[str, str] = None) -> float:
        """Get current counter value.
        
        Args:
            name: Counter name
            labels: Optional labels
            
        Returns:
            Current counter value
        """
        key = self._make_key(name, labels)
        return self.counters.get(key, 0.0)
    
    def get_gauge(self, name: str, labels: Dict[str, str] = None) -> float:
        """Get current gauge value.
        
        Args:
            name: Gauge name
            labels: Optional labels
            
        Returns:
            Current gauge value
        """
        key = self._make_key(name, labels)
        return self.gauges.get(key, 0.0)
    
    def get_histogram_stats(self, name: str, labels: Dict[str, str] = None) -> Dict[str, float]:
        """Get statistics for a histogram.
        
        Args:
            name: Histogram name
            labels: Optional labels
            
        Returns:
            Dictionary with min, max, mean, count
        """
        key = self._make_key(name, labels)
        values = self.histograms.get(key, [])
        
        if not values:
            return {"min": 0, "max": 0, "mean": 0, "count": 0}
        
        return {
            "min": min(values),
            "max": max(values),
            "mean": sum(values) / len(values),
            "count": len(values)
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all metrics.
        
        Returns:
            Dictionary with all metric summaries
        """
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "histograms": {
                name: self.get_histogram_stats(name.split("|")[0], self._parse_labels(name))
                for name in self.histograms.keys()
            },
            "timers": dict(self.timers),
            "total_metrics": len(self.metrics)
        }
    
    def export_json(self, file_path: Path) -> None:
        """Export metrics to JSON file.
        
        Args:
            file_path: Path to output file
        """
        data = {
            "timestamp": datetime.now().isoformat(),
            "summary": self.get_summary(),
            "metrics": [
                {
                    "name": m.name,
                    "type": m.type.value,
                    "value": m.value,
                    "timestamp": m.timestamp.isoformat(),
                    "labels": m.labels
                }
                for m in self.metrics
            ]
        }
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def export_prometheus(self) -> str:
        """Export metrics in Prometheus format.
        
        Returns:
            Prometheus-formatted metrics string
        """
        lines = []
        
        # Export counters
        for key, value in self.counters.items():
            name, labels = self._split_key(key)
            label_str = self._format_labels(labels)
            lines.append(f"{name}{label_str} {value}")
        
        # Export gauges
        for key, value in self.gauges.items():
            name, labels = self._split_key(key)
            label_str = self._format_labels(labels)
            lines.append(f"{name}{label_str} {value}")
        
        return "\n".join(lines)
    
    def reset(self) -> None:
        """Reset all metrics."""
        self.metrics.clear()
        self.counters.clear()
        self.gauges.clear()
        self.histograms.clear()
        self.timers.clear()
        self._timer_starts.clear()
    
    def _make_key(self, name: str, labels: Dict[str, str] = None) -> str:
        """Create a unique key for a metric.
        
        Args:
            name: Metric name
            labels: Optional labels
            
        Returns:
            Unique key string
        """
        if not labels:
            return name
        label_str = ",".join(f"{k}={v}" for k, v in sorted(labels.items()))
        return f"{name}|{label_str}"
    
    def _split_key(self, key: str) -> tuple:
        """Split a key into name and labels.
        
        Args:
            key: Metric key
            
        Returns:
            Tuple of (name, labels_dict)
        """
        if "|" not in key:
            return key, {}
        
        name, label_str = key.split("|", 1)
        labels = dict(pair.split("=") for pair in label_str.split(","))
        return name, labels
    
    def _parse_labels(self, key: str) -> Dict[str, str]:
        """Parse labels from a key.
        
        Args:
            key: Metric key
            
        Returns:
            Labels dictionary
        """
        _, labels = self._split_key(key)
        return labels
    
    def _format_labels(self, labels: Dict[str, str]) -> str:
        """Format labels for Prometheus.

        Args:
            labels: Labels dictionary

        Returns:
            Formatted label string
        """
        if not labels:
            return ""
        label_pairs = [f'{k}="{v}"' for k, v in sorted(labels.items())]
        return "{" + ",".join(label_pairs) + "}"

    def record_request(self, method: str, endpoint: str, status_code: int, duration: float) -> None:
        """Record HTTP request metrics.

        Args:
            method: HTTP method
            endpoint: API endpoint
            status_code: HTTP status code
            duration: Request duration in seconds
        """
        # Increment request counter
        self.increment_counter("http_requests_total", labels={
            "method": method,
            "endpoint": endpoint,
            "status": str(status_code)
        })

        # Record response time histogram
        self.record_histogram("http_request_duration_seconds", duration, labels={
            "method": method,
            "endpoint": endpoint
        })

        # Set current request gauge
        self.set_gauge("http_requests_in_progress", 0)  # This would need to be managed differently

    def record_error(self, error_message: str) -> None:
        """Record error metrics.

        Args:
            error_message: Error message
        """
        self.increment_counter("errors_total", labels={
            "type": "application"
        })

    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics summary.

        Returns:
            Dictionary with current metrics
        """
        return self.get_summary()


# Initialize metrics collector instance
metrics_collector = MetricsCollector()
