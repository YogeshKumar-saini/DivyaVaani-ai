'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/api/analytics-service';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FeedbackForm } from '@/components/shared/FeedbackForm';
import { formatNumber } from '@/lib/utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImportDataDialog } from '@/components/analytics/ImportDataDialog';
import { TrendingUp, Users, Zap, Clock, Activity, Cpu, HardDrive, Server, Database, Sparkles, BarChart3 } from 'lucide-react';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { motion } from 'framer-motion';

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
    if (key.toLowerCase().includes('cpu')) return <Cpu className="text-cyan-400 h-5 w-5" />;
    if (key.toLowerCase().includes('memory') || key.toLowerCase().includes('ram')) return <HardDrive className="text-emerald-400 h-5 w-5" />;
    if (key.toLowerCase().includes('response') || key.toLowerCase().includes('latency')) return <Activity className="text-amber-400 h-5 w-5" />;
    if (key.toLowerCase().includes('cache')) return <Database className="text-sky-400 h-5 w-5" />;
    return <Server className="text-indigo-400 h-5 w-5" />;
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
    { label: 'Queries', value: formatNumber(analytics?.total_queries || 0), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Users', value: formatNumber(analytics?.unique_users || 0), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Cache Hit Rate', value: `${hitRate}%`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Avg Response', value: `${analytics?.avg_response_time?.toFixed(0) || 0} ms`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  const popularQuestions = Object.entries(analytics?.popular_questions || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <GrainOverlay />

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

      <motion.div
        className="mx-auto max-w-7xl space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <section className="rounded-3xl border border-white/10 bg-black/20 p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.15em] uppercase text-white/70">
                <BarChart3 className="h-3.5 w-3.5 text-cyan-400" /> Observability
              </p>
              <h1 className="mt-4 text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70 leading-tight">Analytics Dashboard</h1>
              <p className="mt-2 text-lg text-white/50 font-light">Real-time system health and user engagement telemetry.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">Live System</Badge>
              <Badge variant="outline" className="border-white/10 text-white/60 bg-white/5 backdrop-blur-sm">Auto-refresh 30s</Badge>
              <ImportDataDialog onUploadSuccess={loadAnalytics} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.label} className="border-white/10 bg-black/20 backdrop-blur-xl shadow-lg hover:bg-white/5 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/50">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white tracking-tight">{card.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-2xl border ${card.bg} flex items-center justify-center shadow-inner`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-white/10 bg-black/20 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-400" /> System Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {metrics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(metrics.metrics).map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        {getMetricIcon(key)}
                        <span className="text-xs uppercase tracking-wider font-semibold text-white/40">{key.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-xl font-mono text-white/90">{formatMetricValue(value, key)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-white/30">
                  <Server className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>System metrics are unavailable right now.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-400" /> Top Questions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {popularQuestions.length > 0 ? (
                <div className="space-y-3">
                  {popularQuestions.map(([q, count], i) => (
                    <div key={q} className="group relative rounded-xl border border-white/5 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-sm text-white/80 leading-relaxed font-light">{q}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-white/10 text-white/50 hover:bg-white/20 text-[10px] h-5">{count} queries</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/30">
                  No popular-question data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-white/10 bg-black/20 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white">Product Feedback</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FeedbackForm />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white">Ops Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <span className="block text-xs uppercase text-white/30 mb-1">Config</span>
                Refresh interval: 30 seconds
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <span className="block text-xs uppercase text-white/30 mb-1">Target</span>
                Cache hit rate target: above 70%
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200 flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs uppercase text-cyan-200/50 mb-1">Pro Tip</span>
                  Use import to backfill historical insights.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </div>
  );
}
