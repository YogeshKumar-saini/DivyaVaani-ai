"""Distributed caching system with Redis/Memcached support for embeddings and performance optimization."""

import json
import pickle
import zlib
import hashlib
import time
from typing import Any, Dict, Optional, Union, List, Tuple
from abc import ABC, abstractmethod
import threading
import numpy as np
from src.utils.logger import log


class CacheEntry:
    """Cache entry with metadata."""

    def __init__(self, key: str, value: Any, ttl: Optional[int] = None,
                 compression: bool = True, metadata: Optional[Dict] = None):
        self.key = key
        self.value = value
        self.created_at = time.time()
        self.ttl = ttl
        self.access_count = 0
        self.last_accessed = self.created_at
        self.compression = compression
        self.metadata = metadata or {}
        self.size_bytes = self._calculate_size()

    def _calculate_size(self) -> int:
        """Calculate approximate size of the entry in bytes."""
        try:
            if isinstance(self.value, np.ndarray):
                return self.value.nbytes
            elif isinstance(self.value, (list, dict)):
                return len(json.dumps(self.value).encode('utf-8'))
            else:
                return len(str(self.value).encode('utf-8'))
        except:
            return 1024  # Default estimate

    def is_expired(self) -> bool:
        """Check if entry is expired."""
        if self.ttl is None:
            return False
        return (time.time() - self.created_at) > self.ttl

    def touch(self):
        """Update last accessed time and increment access count."""
        self.last_accessed = time.time()
        self.access_count += 1

    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return {
            'key': self.key,
            'value': self.value,
            'created_at': self.created_at,
            'ttl': self.ttl,
            'access_count': self.access_count,
            'last_accessed': self.last_accessed,
            'compression': self.compression,
            'metadata': self.metadata,
            'size_bytes': self.size_bytes
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'CacheEntry':
        """Create from dictionary."""
        entry = cls(
            key=data['key'],
            value=data['value'],
            ttl=data.get('ttl'),
            compression=data.get('compression', True),
            metadata=data.get('metadata', {})
        )
        entry.created_at = data.get('created_at', time.time())
        entry.access_count = data.get('access_count', 0)
        entry.last_accessed = data.get('last_accessed', entry.created_at)
        entry.size_bytes = data.get('size_bytes', entry._calculate_size())
        return entry


class CacheBackend(ABC):
    """Abstract base class for cache backends."""

    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        pass

    @abstractmethod
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache."""
        pass

    @abstractmethod
    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        pass

    @abstractmethod
    def clear(self) -> bool:
        """Clear all cache entries."""
        pass

    @abstractmethod
    def has_key(self, key: str) -> bool:
        """Check if key exists."""
        pass

    @abstractmethod
    def get_stats(self) -> Dict:
        """Get cache statistics."""
        pass


class MemoryCacheBackend(CacheBackend):
    """In-memory cache backend."""

    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, CacheEntry] = {}
        self.max_size = max_size
        self._lock = threading.RLock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key in self.cache:
                entry = self.cache[key]
                if not entry.is_expired():
                    entry.touch()
                    return entry.value
                else:
                    # Remove expired entry
                    del self.cache[key]
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        with self._lock:
            # Check size limit and evict if necessary
            if len(self.cache) >= self.max_size and key not in self.cache:
                self._evict_lru()

            entry = CacheEntry(key, value, ttl)
            self.cache[key] = entry
            return True

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self.cache:
                del self.cache[key]
                return True
            return False

    def clear(self) -> bool:
        with self._lock:
            self.cache.clear()
            return True

    def has_key(self, key: str) -> bool:
        with self._lock:
            return key in self.cache and not self.cache[key].is_expired()

    def get_stats(self) -> Dict:
        with self._lock:
            total_size = sum(entry.size_bytes for entry in self.cache.values())
            return {
                'entries': len(self.cache),
                'total_size_bytes': total_size,
                'max_size': self.max_size,
                'hit_rate': 0.0,  # Would need to track hits/misses
            }

    def _evict_lru(self):
        """Evict least recently used entry."""
        if not self.cache:
            return

        # Find entry with oldest last_accessed time
        oldest_key = min(self.cache.keys(),
                        key=lambda k: self.cache[k].last_accessed)
        del self.cache[oldest_key]


class RedisCacheBackend(CacheBackend):
    """Redis cache backend."""

    def __init__(self, host: str = 'localhost', port: int = 6379,
                 db: int = 0, password: Optional[str] = None,
                 max_connections: int = 10):
        try:
            import redis
            self.redis = redis.Redis(
                host=host,
                port=port,
                db=db,
                password=password,
                max_connections=max_connections,
                decode_responses=False  # Keep as bytes for numpy arrays
            )
            self.redis.ping()  # Test connection
            log.info("Connected to Redis cache backend")
        except ImportError:
            raise ImportError("redis package not installed")
        except Exception as e:
            log.warning(f"Failed to connect to Redis: {e}, falling back to memory cache")
            raise

    def _serialize_value(self, value: Any, compression: bool = True) -> bytes:
        """Serialize value for storage."""
        try:
            # Handle numpy arrays specially
            if isinstance(value, np.ndarray):
                data = pickle.dumps(value)
            else:
                data = json.dumps(value).encode('utf-8')

            if compression:
                data = zlib.compress(data)

            return data
        except Exception as e:
            log.error(f"Serialization failed: {e}")
            return pickle.dumps(value)

    def _deserialize_value(self, data: bytes, compression: bool = True) -> Any:
        """Deserialize value from storage."""
        try:
            if compression:
                data = zlib.decompress(data)

            # Try JSON first, then pickle
            try:
                return json.loads(data.decode('utf-8'))
            except:
                return pickle.loads(data)
        except Exception as e:
            log.error(f"Deserialization failed: {e}")
            return None

    def get(self, key: str) -> Optional[Any]:
        try:
            data = self.redis.get(key)
            if data is None:
                return None

            # Get metadata
            meta_key = f"{key}:meta"
            meta_data = self.redis.get(meta_key)
            compression = True
            if meta_data:
                try:
                    meta = json.loads(meta_data.decode('utf-8'))
                    compression = meta.get('compression', True)
                except:
                    pass

            return self._deserialize_value(data, compression)
        except Exception as e:
            log.error(f"Redis get failed: {e}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        try:
            # Serialize value
            data = self._serialize_value(value)
            compression = len(data) > 1024  # Compress if > 1KB

            if compression:
                data = zlib.compress(data)

            # Store value
            if ttl:
                self.redis.setex(key, ttl, data)
            else:
                self.redis.set(key, data)

            # Store metadata
            meta_key = f"{key}:meta"
            meta = {'compression': compression, 'created_at': time.time()}
            self.redis.set(meta_key, json.dumps(meta).encode('utf-8'))

            return True
        except Exception as e:
            log.error(f"Redis set failed: {e}")
            return False

    def delete(self, key: str) -> bool:
        try:
            # Delete both key and metadata
            result = self.redis.delete(key)
            self.redis.delete(f"{key}:meta")
            return result > 0
        except Exception as e:
            log.error(f"Redis delete failed: {e}")
            return False

    def clear(self) -> bool:
        try:
            return self.redis.flushdb()
        except Exception as e:
            log.error(f"Redis clear failed: {e}")
            return False

    def has_key(self, key: str) -> bool:
        try:
            return self.redis.exists(key) > 0
        except Exception as e:
            log.error(f"Redis exists failed: {e}")
            return False

    def get_stats(self) -> Dict:
        try:
            info = self.redis.info()
            return {
                'entries': info.get('db0', {}).get('keys', 0),
                'total_size_bytes': info.get('used_memory', 0),
                'connections': info.get('connected_clients', 0),
                'hit_rate': info.get('keyspace_hits', 0) / max(1, info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0))
            }
        except Exception as e:
            log.error(f"Redis stats failed: {e}")
            return {'error': str(e)}


class MemcachedCacheBackend(CacheBackend):
    """Memcached cache backend."""

    def __init__(self, servers: List[str] = None, max_connections: int = 10):
        if servers is None:
            servers = ['localhost:11211']

        try:
            import memcache
            self.mc = memcache.Client(servers, max_connections=max_connections)
            # Test connection
            self.mc.get('test_key')
            log.info("Connected to Memcached cache backend")
        except ImportError:
            raise ImportError("python-memcached package not installed")
        except Exception as e:
            log.warning(f"Failed to connect to Memcached: {e}")
            raise

    def get(self, key: str) -> Optional[Any]:
        try:
            data = self.mc.get(key)
            if data is None:
                return None
            return pickle.loads(data)
        except Exception as e:
            log.error(f"Memcached get failed: {e}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        try:
            data = pickle.dumps(value)
            return self.mc.set(key, data, time=ttl or 0)
        except Exception as e:
            log.error(f"Memcached set failed: {e}")
            return False

    def delete(self, key: str) -> bool:
        try:
            return self.mc.delete(key)
        except Exception as e:
            log.error(f"Memcached delete failed: {e}")
            return False

    def clear(self) -> bool:
        try:
            return self.mc.flush_all()
        except Exception as e:
            log.error(f"Memcached clear failed: {e}")
            return False

    def has_key(self, key: str) -> bool:
        try:
            return self.mc.get(key) is not None
        except Exception as e:
            log.error(f"Memcached exists failed: {e}")
            return False

    def get_stats(self) -> Dict:
        try:
            # Memcached stats are limited
            return {
                'backend': 'memcached',
                'servers': len(self.mc.servers),
            }
        except Exception as e:
            log.error(f"Memcached stats failed: {e}")
            return {'error': str(e)}


class DistributedCache:
    """Distributed caching system with multiple backend support."""

    def __init__(self, backends: List[CacheBackend] = None,
                 cache_warming_enabled: bool = True,
                 compression_threshold: int = 1024):
        if backends is None or len(backends) == 0:
            # Default to memory cache if no backends provided
            backends = [MemoryCacheBackend()]

        self.backends = backends
        self.primary_backend = backends[0]
        self.cache_warming_enabled = cache_warming_enabled
        self.compression_threshold = compression_threshold

        # Performance monitoring
        self.hits = 0
        self.misses = 0
        self.sets = 0
        self.deletes = 0

        # Cache warming
        self.warmup_keys = set()
        self.warmup_data = {}

        log.info(f"Initialized distributed cache with {len(backends)} backends")

    def _generate_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments."""
        # Create a deterministic key from arguments
        key_data = str(args) + str(sorted(kwargs.items()))
        return hashlib.md5(key_data.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        # Try primary backend first
        value = self.primary_backend.get(key)
        if value is not None:
            self.hits += 1
            return value

        # Try other backends
        for backend in self.backends[1:]:
            value = backend.get(key)
            if value is not None:
                # Populate primary backend
                self.primary_backend.set(key, value)
                self.hits += 1
                return value

        self.misses += 1
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None,
            use_compression: Optional[bool] = None) -> bool:
        """Set value in cache."""
        if use_compression is None:
            # Auto-compress based on size
            use_compression = self._should_compress(value)

        success = True
        for backend in self.backends:
            if not backend.set(key, value, ttl):
                success = False

        if success:
            self.sets += 1
        return success

    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        success = True
        for backend in self.backends:
            if not backend.delete(key):
                success = False

        if success:
            self.deletes += 1
        return success

    def clear(self) -> bool:
        """Clear all cache entries."""
        success = True
        for backend in self.backends:
            if not backend.clear():
                success = False
        return success

    def has_key(self, key: str) -> bool:
        """Check if key exists in any backend."""
        for backend in self.backends:
            if backend.has_key(key):
                return True
        return False

    def cached(self, ttl: Optional[int] = None, key_func: Optional[callable] = None):
        """Decorator for caching function results."""
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Generate cache key
                if key_func:
                    key = key_func(*args, **kwargs)
                else:
                    key = self._generate_key(func.__name__, *args, **kwargs)

                # Try cache first
                result = self.get(key)
                if result is not None:
                    return result

                # Execute function
                result = func(*args, **kwargs)

                # Cache result
                self.set(key, result, ttl)

                return result
            return wrapper
        return decorator

    def warmup(self, keys_data: Dict[str, Any]):
        """Warm up cache with predefined data."""
        if not self.cache_warming_enabled:
            return

        log.info(f"Warming up cache with {len(keys_data)} entries")
        for key, data in keys_data.items():
            self.set(key, data)
            self.warmup_keys.add(key)

        self.warmup_data.update(keys_data)
        log.info("Cache warmup completed")

    def get_performance_stats(self) -> Dict:
        """Get performance statistics."""
        total_requests = self.hits + self.misses
        hit_rate = self.hits / max(1, total_requests)

        stats = {
            'hits': self.hits,
            'misses': self.misses,
            'sets': self.sets,
            'deletes': self.deletes,
            'hit_rate': hit_rate,
            'total_requests': total_requests,
            'backends': len(self.backends),
            'warmup_entries': len(self.warmup_keys)
        }

        # Add backend-specific stats
        for i, backend in enumerate(self.backends):
            backend_stats = backend.get_stats()
            stats[f'backend_{i}'] = backend_stats

        return stats

    def _should_compress(self, value: Any) -> bool:
        """Determine if value should be compressed."""
        try:
            if isinstance(value, np.ndarray):
                return value.nbytes > self.compression_threshold
            elif isinstance(value, (str, bytes)):
                return len(value) > self.compression_threshold
            elif isinstance(value, (list, dict)):
                return len(json.dumps(value)) > self.compression_threshold
            else:
                return False
        except:
            return False

    def optimize(self):
        """Optimize cache performance."""
        # This could implement cache optimization strategies
        # like compaction, rebalancing, etc.
        log.info("Running cache optimization")

        # Clear expired entries (backends should handle this automatically)
        # Rebalance if using multiple backends
        # Compress if needed

        log.info("Cache optimization completed")


# Global cache instance
_cache_instance = None

def get_cache_instance() -> DistributedCache:
    """Get global cache instance."""
    global _cache_instance
    if _cache_instance is None:
        # Try to create distributed cache with available backends
        backends = []

        # Always add memory cache
        backends.append(MemoryCacheBackend(max_size=5000))

        # Try Redis
        try:
            backends.append(RedisCacheBackend())
        except:
            log.debug("Redis not available, skipping")

        # Try Memcached
        try:
            backends.append(MemcachedCacheBackend())
        except:
            log.debug("Memcached not available, skipping")

        _cache_instance = DistributedCache(backends=backends)

    return _cache_instance
