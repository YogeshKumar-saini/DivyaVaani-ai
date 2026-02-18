'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsService } from '@/lib/api/analytics-service';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FeedbackFormDialog } from '@/components/analytics/FeedbackFormDialog';
import { formatNumber } from '@/lib/utils/formatting';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImportDataDialog } from '@/components/analytics/ImportDataDialog';
import {
  TrendingUp, Users, Zap, Clock, Activity, Cpu, HardDrive,
  Server, Database, Sparkles, BarChart3, RefreshCw, CheckCircle2,
  ArrowUpRight, MessageSquare, AlertCircle, Info
} from 'lucide-react';
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  })
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'unknown'>('unknown');

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await analyticsService.getAnalytics();
      setAnalytics(data.analytics);
      setLastUpdated(new Date());
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
      setIsRefreshing(false);
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await analyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    try {
      const data = await analyticsService.getHealth();
      setHealthStatus(data.system_ready ? 'healthy' : 'degraded');
    } catch {
      setHealthStatus('degraded');
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    loadMetrics();
    loadHealth();
    const interval = setInterval(() => {
      loadAnalytics();
      loadMetrics();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics, loadMetrics, loadHealth]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadAnalytics(), loadMetrics(), loadHealth()]);
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
    if (key.toLowerCase().includes('cpu')) return <Cpu className="text-cyan-400 h-4 w-4" />;
    if (key.toLowerCase().includes('memory') || key.toLowerCase().includes('ram')) return <HardDrive className="text-emerald-400 h-4 w-4" />;
    if (key.toLowerCase().includes('response') || key.toLowerCase().includes('latency')) return <Activity className="text-amber-400 h-4 w-4" />;
    if (key.toLowerCase().includes('cache')) return <Database className="text-sky-400 h-4 w-4" />;
    return <Server className="text-sky-400 h-4 w-4" />;
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

  const statCards = [
    {
      label: 'Total Queries',
      value: formatNumber(analytics?.total_queries || 0),
      subtext: 'all time',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-600/10 to-sky-600/5',
      border: 'border-cyan-500/15',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Unique Users',
      value: formatNumber(analytics?.unique_users || 0),
      subtext: 'distinct sessions',
      icon: Users,
      color: 'text-blue-400',
      bgGlow: 'from-blue-600/10 to-cyan-600/5',
      border: 'border-blue-500/15',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Cache Hit Rate',
      value: `${hitRate}%`,
      subtext: hitRate > 70 ? 'target met ✓' : 'below target',
      icon: Zap,
      color: 'text-amber-400',
      bgGlow: 'from-amber-600/10 to-yellow-600/5',
      border: 'border-amber-500/15',
      trend: hitRate > 70 ? 'Healthy' : 'Low',
      trendUp: hitRate > 70,
    },
    {
      label: 'Avg Response',
      value: `${analytics?.avg_response_time?.toFixed(0) || 0}ms`,
      subtext: 'per query',
      icon: Clock,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-600/10 to-teal-600/5',
      border: 'border-emerald-500/15',
      trend: 'Fast',
      trendUp: true,
    },
  ];

  const popularQuestions = Object.entries(analytics?.popular_questions || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const maxQueryCount = popularQuestions[0]?.[1] || 1;

  return (
    <div className="min-h-screen py-4 pb-10 px-4 sm:px-6 lg:px-8 relative">

      {/* Ambient background */}
      <div className="fixed top-0 right-0 w-[600px] h-[500px] bg-cyan-900/6 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-sky-900/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl space-y-6 relative z-10">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-white/3 border border-white/7 p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-cyan-600/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-white/50 mb-4">
                <BarChart3 className="h-3 w-3 text-cyan-400" />
                Observability
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold bg-clip-text text-transparent bg-linear-to-br from-white via-white/90 to-white/60 leading-tight">
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-white/40 font-light">
                Real-time system health and engagement telemetry
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/65 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/8"
              >
                <RefreshCw size={12} className={`text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </button>

              <Badge
                className={`px-3 py-1 text-[11px] border ${
                  healthStatus === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : healthStatus === 'degraded'
                    ? 'bg-red-500/10 text-red-300 border-red-500/20'
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                {healthStatus === 'healthy' ? (
                  <><CheckCircle2 size={11} className="mr-1.5" /> System Healthy</>
                ) : healthStatus === 'degraded' ? (
                  <><AlertCircle size={11} className="mr-1.5" /> Degraded</>
                ) : (
                  <><Info size={11} className="mr-1.5" /> Checking...</>
                )}
              </Badge>

              <FeedbackFormDialog onSubmit={loadAnalytics} />
              <ImportDataDialog onUploadSuccess={loadAnalytics} />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={`rounded-2xl border ${card.border} bg-white/2 relative overflow-hidden group p-5 hover:bg-white/4 transition-colors duration-300`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative flex items-start justify-between mb-5">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/6">
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                  card.trendUp ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400' : 'border-red-500/20 bg-red-500/8 text-red-400'
                }`}>
                  <ArrowUpRight size={10} />
                  <span>{card.trend}</span>
                </div>
              </div>

              <div className="relative">
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">{card.label}</p>
                <p className="text-[28px] font-bold text-white mt-1 tracking-tight leading-none">{card.value}</p>
                <p className="text-[11px] text-white/25 mt-1.5 font-light">{card.subtext}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* System Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="xl:col-span-2 rounded-2xl bg-white/2 border border-white/7 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <h2 className="text-white font-semibold flex items-center gap-2 text-[15px]">
                <Activity className="h-4 w-4 text-sky-400" />
                System Metrics
              </h2>
              <Badge variant="outline" className="border-white/10 text-white/35 bg-white/3 text-[10px]">
                Auto-refresh 30s
              </Badge>
            </div>
            <div className="p-5">
              {metrics && Object.keys(metrics.metrics).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(metrics.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 p-4 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/8 transition-colors shrink-0">
                        {getMetricIcon(key)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold truncate">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[15px] font-mono text-white/85 mt-0.5 truncate">
                          {formatMetricValue(value, key)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-white/20">
                  <Server className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">System metrics unavailable</p>
                  <p className="text-xs mt-1 text-white/15">Metrics may be disabled in configuration</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="rounded-2xl bg-white/2 border border-white/7 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h2 className="text-white font-semibold text-[15px]">Top Questions</h2>
              </div>
              {popularQuestions.length > 0 && (
                <Badge variant="outline" className="border-amber-500/20 text-amber-400/60 bg-amber-500/5 text-[10px]">
                  {popularQuestions.length} queries
                </Badge>
              )}
            </div>
            <div className="p-4">
              {popularQuestions.length > 0 ? (
                <div className="space-y-2">
                  {popularQuestions.map(([q, count], i) => (
                    <div
                      key={q}
                      className="group flex items-start gap-3 rounded-xl border border-white/5 hover:border-white/9 bg-white/2 hover:bg-white/5 px-4 py-3 transition-all"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] text-amber-300 font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white/65 leading-snug font-light line-clamp-2">{q}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-amber-500/60 to-amber-400/40 transition-all duration-700"
                              style={{ width: `${(count / maxQueryCount) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-white/25 shrink-0">{count}×</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No query data yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Feedback CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="xl:col-span-2 rounded-2xl border border-cyan-500/15 bg-white/2 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-linear-to-br from-cyan-600/5 via-transparent to-sky-600/4 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/25 to-transparent" />

            <div className="relative p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-white mb-1">Share Your Feedback</h2>
                  <p className="text-[13px] text-white/40 font-light leading-relaxed max-w-sm">
                    Help us improve DivyaVaani. Report bugs, request features, or rate answer accuracy — all feedback is saved to our database.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Bug Report', 'Feature Request', 'Accuracy', 'Performance'].map((tag) => (
                      <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full border border-white/8 bg-white/4 text-white/35">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <FeedbackFormDialog onSubmit={loadAnalytics} />
              </div>
            </div>
          </motion.div>

          {/* Ops Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45 }}
            className="rounded-2xl bg-white/2 border border-white/7 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/6">
              <Server className="h-4 w-4 text-sky-400" />
              <h2 className="text-white font-semibold text-[15px]">Operations</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-xl border border-white/7 bg-white/2 p-4">
                <span className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Config</span>
                <span className="text-[13px] text-white/55 font-light">Refresh interval: 30 seconds</span>
              </div>
              <div className="rounded-xl border border-white/7 bg-white/2 p-4">
                <span className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Cache Target</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${hitRate > 70 ? 'bg-linear-to-r from-emerald-500 to-cyan-500' : 'bg-linear-to-r from-amber-500 to-orange-500'}`}
                      style={{ width: `${Math.min(hitRate, 100)}%` }}
                    />
                  </div>
                  <span className={`text-[12px] font-mono shrink-0 ${hitRate > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{hitRate}%</span>
                </div>
                <div className="flex justify-between text-[11px] mt-1.5">
                  <span className="text-white/25">Hits: {analytics?.cache_hits || 0}</span>
                  <span className="text-white/25">Misses: {analytics?.cache_misses || 0}</span>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-cyan-300/50 mb-1">Pro Tip</span>
                    <span className="text-[12px] text-cyan-200/55 font-light leading-relaxed">
                      Use import to backfill historical insights for richer analytics context.
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="w-full border-white/8 bg-white/3 text-white/50 hover:bg-white/8 hover:text-white/80 text-[13px] gap-2 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

