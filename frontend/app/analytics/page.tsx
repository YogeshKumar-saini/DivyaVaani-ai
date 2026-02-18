'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/api/analytics-service';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FeedbackForm } from '@/components/shared/FeedbackForm';
import { formatNumber } from '@/lib/utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImportDataDialog } from '@/components/analytics/ImportDataDialog';
import { TrendingUp, Users, Zap, Clock, Activity, Cpu, HardDrive, Server, Database, Sparkles } from 'lucide-react';

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
        popular_questions: {},
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" variant="spiritual" text="Loading analytics..." />
      </div>
    );
  }

  const hitRate = analytics && analytics.cache_hits + analytics.cache_misses > 0
    ? Math.round((analytics.cache_hits / (analytics.cache_hits + analytics.cache_misses)) * 100)
    : 0;

  const getMetricIcon = (key: string) => {
    if (key.toLowerCase().includes('cpu')) return <Cpu className="text-cyan-200 h-5 w-5" />;
    if (key.toLowerCase().includes('memory') || key.toLowerCase().includes('ram')) return <HardDrive className="text-emerald-200 h-5 w-5" />;
    if (key.toLowerCase().includes('response') || key.toLowerCase().includes('latency')) return <Activity className="text-amber-200 h-5 w-5" />;
    if (key.toLowerCase().includes('cache')) return <Database className="text-sky-200 h-5 w-5" />;
    return <Server className="text-indigo-200 h-5 w-5" />;
  };

  const formatMetricValue = (value: unknown, key: string): string => {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('latency')) return `${value.toFixed(2)}ms`;
      if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage')) return `${value.toFixed(1)}%`;
      if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value > 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toFixed(0);
    }
    if (typeof value === 'object' && value !== null) return `${Object.keys(value).length} entries`;
    if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
    return String(value);
  };

  const cards = [
    { label: 'Queries', value: formatNumber(analytics?.total_queries || 0), icon: TrendingUp },
    { label: 'Users', value: formatNumber(analytics?.unique_users || 0), icon: Users },
    { label: 'Cache Hit Rate', value: `${hitRate}%`, icon: Zap },
    { label: 'Avg Response', value: `${analytics?.avg_response_time?.toFixed(0) || 0} ms`, icon: Clock },
  ];

  const popularQuestions = Object.entries(analytics?.popular_questions || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">Observability</p>
              <h1 className="text-3xl md:text-4xl text-slate-50" style={{ fontFamily: 'var(--font-playfair)' }}>Analytics Dashboard</h1>
              <p className="mt-2 text-slate-300">Real-time system and usage telemetry.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-300/30">Live</Badge>
              <Badge variant="outline" className="border-cyan-200/25 text-slate-200">Auto-refresh 30s</Badge>
              <ImportDataDialog onUploadSuccess={loadAnalytics} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.label} className="border-cyan-200/15 bg-slate-900/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">{card.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-50">{card.value}</p>
                  </div>
                  <div className="h-11 w-11 rounded-xl border border-cyan-200/25 bg-cyan-300/10 flex items-center justify-center">
                    <card.icon className="h-5 w-5 text-cyan-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 border-cyan-200/15 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100">System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(metrics.metrics).map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-cyan-200/15 bg-slate-800/70 p-4">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(key)}
                        <span className="text-xs uppercase tracking-wider text-slate-300">{key.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="mt-2 text-xl font-semibold text-slate-100">{formatMetricValue(value, key)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-300">System metrics are unavailable right now.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-cyan-200/15 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100">Top Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {popularQuestions.length > 0 ? (
                <div className="space-y-3">
                  {popularQuestions.map(([q, count]) => (
                    <div key={q} className="rounded-xl border border-cyan-200/15 bg-slate-800/70 px-3 py-2">
                      <p className="text-sm text-slate-100 leading-relaxed">{q}</p>
                      <p className="text-xs text-cyan-200 mt-1">{count} queries</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-cyan-200/15 bg-slate-800/70 p-3 text-sm text-slate-300">
                  No popular-question data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 border-cyan-200/15 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100">Product Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackForm />
            </CardContent>
          </Card>

          <Card className="border-cyan-200/15 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100">Ops Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-cyan-200/15 bg-slate-800/70 p-3 text-sm text-slate-300">Refresh interval: 30 seconds</div>
              <div className="rounded-xl border border-cyan-200/15 bg-slate-800/70 p-3 text-sm text-slate-300">Cache hit rate target: above 70%</div>
              <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/10 p-3 text-sm text-cyan-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Use import to backfill historical insights.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
