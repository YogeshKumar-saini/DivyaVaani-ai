"""Response caching and analytics for the QA system."""

import hashlib
import json
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import threading
from collections import defaultdict
import os


class ResponseCache:
    """Simple in-memory cache for responses with TTL."""

    def __init__(self, max_size: int = 1000, ttl_seconds: int = 3600):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.lock = threading.Lock()

    def _get_cache_key(self, question: str) -> str:
        """Generate cache key from question."""
        return hashlib.md5(question.lower().strip().encode()).hexdigest()

    def get(self, question: str) -> Optional[Dict[str, Any]]:
        """Get cached response if available and not expired."""
        key = self._get_cache_key(question)
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                if time.time() - entry['timestamp'] < self.ttl_seconds:
                    return entry['data']
                else:
                    # Remove expired entry
                    del self.cache[key]
        return None

    def set(self, question: str, response: Dict[str, Any]) -> None:
        """Cache a response."""
        key = self._get_cache_key(question)
        with self.lock:
            # Remove oldest entries if cache is full
            if len(self.cache) >= self.max_size:
                oldest_key = min(self.cache.keys(),
                               key=lambda k: self.cache[k]['timestamp'])
                del self.cache[oldest_key]

            self.cache[key] = {
                'data': response,
                'timestamp': time.time()
            }

    def clear(self) -> None:
        """Clear all cached responses."""
        with self.lock:
            self.cache.clear()

    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        with self.lock:
            return {
                'total_entries': len(self.cache),
                'max_size': self.max_size,
                'ttl_seconds': self.ttl_seconds
            }


class AnalyticsTracker:
    """Track usage analytics for the QA system."""

    def __init__(self):
        self.stats = {
            'total_queries': 0,
            'unique_users': set(),
            'popular_questions': defaultdict(int),
            'response_times': [],
            'error_count': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'start_time': datetime.now()
        }
        self.lock = threading.Lock()

    def track_query(self, user_id: str, question: str, response_time: float,
                   cached: bool = False) -> None:
        """Track a query."""
        with self.lock:
            self.stats['total_queries'] += 1
            self.stats['unique_users'].add(user_id)
            self.stats['popular_questions'][question.lower().strip()] += 1
            self.stats['response_times'].append(response_time)

            if cached:
                self.stats['cache_hits'] += 1
            else:
                self.stats['cache_misses'] += 1

    def track_error(self) -> None:
        """Track an error."""
        with self.lock:
            self.stats['error_count'] += 1

    def get_stats(self) -> Dict[str, Any]:
        """Get current statistics."""
        with self.lock:
            stats_copy = self.stats.copy()
            stats_copy['unique_users'] = len(stats_copy['unique_users'])

            # Calculate averages
            if stats_copy['response_times']:
                stats_copy['avg_response_time'] = sum(stats_copy['response_times']) / len(stats_copy['response_times'])
                stats_copy['min_response_time'] = min(stats_copy['response_times'])
                stats_copy['max_response_time'] = max(stats_copy['response_times'])
            else:
                stats_copy['avg_response_time'] = 0
                stats_copy['min_response_time'] = 0
                stats_copy['max_response_time'] = 0

            # Get top questions
            stats_copy['top_questions'] = sorted(
                stats_copy['popular_questions'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]

            # Calculate uptime
            stats_copy['uptime_seconds'] = (datetime.now() - stats_copy['start_time']).total_seconds()

            return stats_copy


# Global instances
response_cache = ResponseCache()
analytics = AnalyticsTracker()
