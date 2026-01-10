'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/api/analytics-service';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FeedbackForm } from '@/components/shared/FeedbackForm';
import { formatNumber } from '@/lib/utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { ImportDataDialog } from '@/components/analytics/ImportDataDialog';
import {
  TrendingUp,
  Users,
  Zap,
  Clock,
  Activity,
  Cpu,
  HardDrive,
  Server,
  Database
} from 'lucide-react';

interface Analytics {
  total_queries: number;
  unique_users: number;
  cache_hits: number;
  cache_misses: number;
  avg_response_time: number;
  popular_questions?: Record<string, number>;
}

interface MetricsData {
  metrics: Record<string, unknown>;
  timestamp: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadMetrics();
    const interval = setInterval(() => {
      loadAnalytics();
      loadMetrics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getAnalytics();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics({
        total_queries: 0,
        unique_users: 0,
        cache_hits: 0,
        cache_misses: 0,
        avg_response_time: 0,
        popular_questions: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await analyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  if (isLoading) {
    return (
      <AuroraBackground className="flex-1 w-full min-h-screen" showRadialGradient={false}>
        <GrainOverlay />
        <div className="flex items-center justify-center h-screen w-full relative z-10">
          <LoadingSpinner size="xl" variant="spiritual" text="Loading analytics..." />
        </div>
      </AuroraBackground>
    );
  }

  const getMetricIcon = (key: string) => {
    if (key.toLowerCase().includes('cpu')) return <Cpu className="text-orange-400 h-6 w-6" />;
    if (key.toLowerCase().includes('memory') || key.toLowerCase().includes('ram')) return <HardDrive className="text-emerald-400 h-6 w-6" />;
    if (key.toLowerCase().includes('response') || key.toLowerCase().includes('latency')) return <Activity className="text-yellow-400 h-6 w-6" />;
    if (key.toLowerCase().includes('cache')) return <Database className="text-blue-400 h-6 w-6" />;
    return <Server className="text-violet-400 h-6 w-6" />;
  };

  const formatMetricValue = (value: unknown, key: string): string => {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('latency')) {
        return `${value.toFixed(2)}ms`;
      }
      if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage')) {
        return `${value.toFixed(1)}%`;
      }
      if (value > 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value > 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toFixed(0);
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        if (key.toLowerCase().includes('histograms') || key.toLowerCase().includes('timers')) {
          return `${value.length} items`;
        }
        return `Array(${value.length})`;
      }
      const entries = Object.keys(value);
      if (entries.length > 0) {
        if (key.toLowerCase().includes('gauges') || key.toLowerCase().includes('counters')) {
          return `${entries.length} entries`;
        }
        if (key.toLowerCase().includes('histograms')) {
          return `${entries.length} metrics`;
        }
      }
      return `${entries.length} props`;
    }
    if (typeof value === 'boolean') {
      return value ? 'Active' : 'Inactive';
    }
    return String(value);
  };

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      <GrainOverlay />
      <AuroraBackground className="flex-1 w-full min-h-0 h-full relative" showRadialGradient={false}>
        <div className="w-full relative z-10 py-12 pt-24 md:pt-32">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-12 text-center relative">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 drop-shadow-sm">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-2xl mx-auto px-4">
                Real-time system performance monitoring and usage metrics
              </p>
              <div className="flex flex-wrap justify-center gap-3 items-center">
                <Badge variant="default" className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30 backdrop-blur-sm">Live</Badge>
                <Badge variant="outline" className="border-white/10 bg-white/5 backdrop-blur-sm">Auto-refresh</Badge>

                <div className="ml-2 pl-2 border-l border-white/10">
                  <ImportDataDialog onUploadSuccess={loadAnalytics} />
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Queries */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-300">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-orange-500 border border-orange-500/20">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {formatNumber(analytics?.total_queries || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Queries</div>
                </CardContent>
              </Card>

              {/* Unique Users */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-300">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500 border border-blue-500/20">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {formatNumber(analytics?.unique_users || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Users</div>
                </CardContent>
              </Card>

              {/* Cache Hit Rate */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-300">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500 border border-emerald-500/20">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {analytics && (analytics.cache_hits + analytics.cache_misses) > 0
                      ? Math.round((analytics.cache_hits / (analytics.cache_hits + analytics.cache_misses)) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Cache Hit</div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-300">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 text-yellow-500 border border-yellow-500/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {analytics?.avg_response_time?.toFixed(0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Response(ms)</div>
                </CardContent>
              </Card>
            </div>

            {/* System Metrics */}
            <Card className="mb-12 shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
              <CardHeader className="border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-orange-500" />
                  <CardTitle className="text-foreground">System Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {metrics ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(metrics.metrics).map(([key, value], idx) => (
                      <div key={idx} className="flex flex-col items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-center">
                        <div className="p-2 rounded-full bg-white/5 mb-3 border border-white/5">
                          {getMetricIcon(key)}
                        </div>
                        <div className="text-lg font-bold mb-1 text-foreground">
                          {formatMetricValue(value, key)}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4 opacity-20" />
                    <p>System metrics not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <div className="max-w-3xl mx-auto">
              <Card className="border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                <CardHeader className="text-center pb-4 relative">
                  <CardTitle className="text-2xl text-foreground font-bold">Help Improve Our Service</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">Your feedback helps us improve the spiritual guidance experience for everyone.</p>
                </CardHeader>
                <CardContent className="p-6 pt-2 relative">
                  <FeedbackForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
}
