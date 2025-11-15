'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { analyticsService } from '@/lib/api/analytics-service';
import { handleAPIError } from '@/lib/api/client';

interface HealthStatus {
  status: string;
  timestamp: number;
  system_ready: boolean;
  is_loading: boolean;
  components?: {
    qa_system: string;
    retriever: string;
    embeddings: string;
  };
  components_health?: Record<string, {
    status: string;
    message: string;
    details: Record<string, unknown>;
  }>;
}

export function SystemStatusCard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHealthStatus();
    const interval = setInterval(loadHealthStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHealthStatus = async () => {
    try {
      setError(null);
      const healthData = await analyticsService.getHealth();
      setHealth(healthData);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error':
      case 'unhealthy':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
        <div className="flex items-center space-x-3 mb-4">
          <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-red-200/50">
        <div className="flex items-center space-x-3 mb-4">
          <XCircle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadHealthStatus}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-professional border border-orange-200/50 card-professional">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-orange-500" />
          <h3 className="text-xl font-bold text-gray-900">System Status</h3>
        </div>
        {getStatusIcon(health?.status || 'unknown')}
      </div>

      <div className="space-y-4">
        {/* Overall Status */}
        <div className={`px-4 py-3 rounded-xl border ${getStatusColor(health?.status || 'unknown')} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Overall Status</span>
            <span className="text-sm font-bold capitalize">{health?.status || 'Unknown'}</span>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {health?.system_ready !== undefined && (
            <div className="flex items-center justify-between p-4 bg-gradient-calm rounded-xl border border-white/50 hover-lift">
              <span className="text-sm text-gray-700 font-medium">System Ready</span>
              <div className="flex items-center space-x-2">
                {health.system_ready ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-semibold">Ready</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600 font-semibold">Not Ready</span>
                  </>
                )}
              </div>
            </div>
          )}

          {health?.is_loading && (
            <div className="flex items-center justify-between p-4 bg-gradient-warm rounded-xl border border-white/50 hover-lift">
              <span className="text-sm text-gray-700 font-medium">Initializing</span>
              <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Components Health */}
        {health?.components_health && Object.keys(health.components_health).length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Components Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(health.components_health).map(([component, status]) => (
                <div key={component} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover-lift">
                  <span className="text-sm text-gray-700 font-medium capitalize">{component.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.status)}
                    <span className={`text-xs font-bold capitalize ${
                      status.status.toLowerCase() === 'healthy' ? 'text-green-600' :
                      status.status.toLowerCase() === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {status.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 pt-4 border-t border-gray-200 text-center font-medium">
          Last updated: {health?.timestamp ? new Date(health.timestamp * 1000).toLocaleTimeString() : 'Never'}
        </div>
      </div>
    </div>
  );
}
