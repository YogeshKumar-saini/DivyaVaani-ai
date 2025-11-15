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
}

interface HealthIndicatorProps {
  variant?: 'badge' | 'icon' | 'minimal';
  showText?: boolean;
  className?: string;
}

export function HealthIndicator({ variant = 'badge', showText = true, className = '' }: HealthIndicatorProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHealthStatus();
    const interval = setInterval(loadHealthStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []); // Empty dependency array is correct here

  const loadHealthStatus = async () => {
    try {
      const healthData = await analyticsService.getHealth();
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to load health status:', error);
      setHealth({
        status: 'error',
        timestamp: Date.now() / 1000,
        system_ready: false,
        is_loading: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          text: 'Healthy',
          textColor: 'text-green-700',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500',
          text: 'Warning',
          textColor: 'text-yellow-700',
        };
      case 'error':
      case 'unhealthy':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          text: 'Error',
          textColor: 'text-red-700',
        };
      default:
        return {
          icon: Loader2,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500',
          text: 'Unknown',
          textColor: 'text-gray-700',
        };
    }
  };

  if (isLoading) {
    const LoadingIcon = Loader2;
    if (variant === 'icon') {
      return <LoadingIcon className={`h-4 w-4 text-gray-500 animate-spin ${className}`} />;
    }
    if (variant === 'minimal') {
      return <div className={`h-2 w-2 rounded-full bg-gray-400 animate-pulse ${className}`} />;
    }
    return (
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200/50 shadow-sm ${className}`}>
        <Loader2 className="h-2.5 w-2.5 text-gray-500 animate-spin" />
        {showText && <span className="text-sm font-medium text-gray-700">Loading...</span>}
      </div>
    );
  }

  if (!health) return null;

  const statusInfo = getStatusInfo(health.status);

  if (variant === 'icon') {
    const StatusIcon = statusInfo.icon;
    return <StatusIcon className={`h-4 w-4 ${statusInfo.color} ${className}`} />;
  }

  if (variant === 'minimal') {
    return (
      <div
        className={`h-2 w-2 rounded-full ${statusInfo.bgColor} animate-pulse ${className}`}
        title={`${statusInfo.text} - ${health.system_ready ? 'Ready' : 'Not Ready'}`}
      />
    );
  }

  // Default badge variant
  const StatusIcon = statusInfo.icon;
  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200/50 shadow-sm cursor-help ${className}`}
      title={`System Status: ${statusInfo.text} | Ready: ${health.system_ready ? 'Yes' : 'No'} | Last checked: ${new Date(health.timestamp * 1000).toLocaleTimeString()}`}
    >
      <StatusIcon className={`h-2.5 w-2.5 ${statusInfo.color} ${health.status === 'healthy' ? 'animate-pulse' : ''}`} />
      {showText && (
        <span className={`text-sm font-medium ${statusInfo.textColor}`}>
          {statusInfo.text}
        </span>
      )}
    </div>
  );
}
