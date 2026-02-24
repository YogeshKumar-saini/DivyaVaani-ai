'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { analyticsService } from '@/lib/api/analytics-service';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatNumber } from '@/lib/utils/formatting';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImportDataDialog } from '@/components/analytics/ImportDataDialog';
import ChatInsights from '@/components/analytics/ChatInsights';
import { useAuth } from '@/lib/context/auth-provider';
import {
  TrendingUp, Users, Zap, Clock, Activity, Cpu, HardDrive,
  Server, Database, Sparkles, BarChart3, RefreshCw, CheckCircle2,
  ArrowUpRight, MessageSquare, AlertCircle, Info, LogIn,
  Globe, Shield, BookOpen, Timer, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Analytics {
  total_queries: number;
  unique_users: number;
  cache_hits: number;
  cache_misses: number;
  avg_response_time: number;
  popular_questions?: Record<string, number>;
  uptime_seconds?: number;
  error_count?: number;
}

interface MetricsData {
  metrics: Record<string, unknown>;
  timestamp: number;
}

// Flatten nested metrics object into individual key-value pairs
function flattenMetrics(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      // Don't flatten histogram stat objects (they have min/max/mean/count)
      !(typeof (value as Record<string, unknown>).mean === 'number')
    ) {
      Object.assign(result, flattenMetrics(value as Record<string, unknown>, prefixedKey));
    } else {
      result[prefixedKey] = value;
    }
  }
  return result;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  })
};

// ── Guest View Component ────────────────────────────────────────────────────

function GuestView({
  analytics,
  healthStatus,
  isRefreshing,
  lastUpdated,
  onRefresh,
}: {
  analytics: Analytics | null;
  healthStatus: 'healthy' | 'degraded' | 'unknown';
  isRefreshing: boolean;
  lastUpdated: Date;
  onRefresh: () => void;
}) {
  const hitRate = analytics && analytics.cache_hits + analytics.cache_misses > 0
    ? Math.round((analytics.cache_hits / (analytics.cache_hits + analytics.cache_misses)) * 100)
    : 0;

  const uptimeHours = analytics?.uptime_seconds
    ? Math.floor(analytics.uptime_seconds / 3600)
    : 0;
  const uptimeMinutes = analytics?.uptime_seconds
    ? Math.floor((analytics.uptime_seconds % 3600) / 60)
    : 0;

  const publicStats = [
    {
      label: 'System Status',
      value: healthStatus === 'healthy' ? 'Healthy' : healthStatus === 'degraded' ? 'Degraded' : 'Checking...',
      icon: Shield,
      color: healthStatus === 'healthy' ? 'text-emerald-400' : healthStatus === 'degraded' ? 'text-red-400' : 'text-white/40',
      bgGlow: healthStatus === 'healthy' ? 'from-emerald-600/10 to-teal-600/5' : 'from-red-600/10 to-orange-600/5',
      border: healthStatus === 'healthy' ? 'border-emerald-500/15' : 'border-red-500/15',
    },
    {
      label: 'Questions Answered',
      value: formatNumber(analytics?.total_queries || 0),
      icon: MessageSquare,
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-600/10 to-sky-600/5',
      border: 'border-cyan-500/15',
    },
    {
      label: 'Uptime',
      value: uptimeHours > 0 ? `${uptimeHours}h ${uptimeMinutes}m` : `${uptimeMinutes}m`,
      icon: Timer,
      color: 'text-blue-400',
      bgGlow: 'from-blue-600/10 to-cyan-600/5',
      border: 'border-blue-500/15',
    },
    {
      label: 'Cache Efficiency',
      value: `${hitRate}%`,
      icon: Zap,
      color: 'text-amber-400',
      bgGlow: 'from-amber-600/10 to-yellow-600/5',
      border: 'border-amber-500/15',
    },
  ];

  const features = [
    { icon: Globe, title: 'Multi-Language Support', description: 'Ask in English, Hindi, Sanskrit and more', color: 'text-cyan-400' },
    { icon: BookOpen, title: 'Universal Wisdom', description: 'Drawing from all spiritual traditions', color: 'text-violet-400' },
    { icon: Zap, title: 'Instant Responses', description: 'AI-powered answers with smart caching', color: 'text-amber-400' },
    { icon: Layers, title: 'Chat Insights', description: 'Track your spiritual journey over time', color: 'text-emerald-400' },
  ];

  return (
    <>
      {/* Public Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {publicStats.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`rounded-xl sm:rounded-2xl border ${card.border} bg-white/2 relative overflow-hidden group p-3 sm:p-4 md:p-5 hover:bg-white/4 transition-colors duration-300`}
          >
            <div className={`absolute inset-0 bg-linear-to-br ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative flex items-start mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/6">
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </div>
            </div>
            <div className="relative">
              <p className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wider font-semibold">{card.label}</p>
              <p className="text-xl sm:text-2xl md:text-[28px] font-bold text-white mt-0.5 sm:mt-1 tracking-tight leading-none">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="rounded-xl sm:rounded-2xl bg-white/2 border border-white/7 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/6">
          <h2 className="text-white font-semibold flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-[15px]">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-400" />
            Platform Features
          </h2>
        </div>
        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 p-4 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/8 transition-colors shrink-0">
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white/80">{feature.title}</p>
                  <p className="text-[11px] text-white/35 mt-0.5 font-light">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sign In CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5 }}
        className="rounded-xl sm:rounded-2xl border border-violet-500/20 bg-white/2 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-linear-to-br from-violet-600/5 via-transparent to-cyan-600/4 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

        <div className="relative p-6 sm:p-8 md:p-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center mb-5">
            <BarChart3 className="h-6 w-6 text-violet-400" />
          </div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold text-white mb-2">
            Unlock Full Analytics
          </h2>
          <p className="text-[13px] text-white/40 font-light leading-relaxed max-w-md mb-6">
            Sign in to access detailed system metrics, chat insights,
            personalized summaries, data import tools, and more.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl gap-2 transition-all duration-200">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white px-6 py-2.5 rounded-xl transition-all duration-200">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Refresh info */}
      <div className="flex justify-center">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : `Last updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </button>
      </div>
    </>
  );
}

// ── Main Analytics Page ─────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'unknown'>('unknown');
  const [activeTab, setActiveTab] = useState<'system' | 'insights'>('system');

  const isAuthenticated = !!user;

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
    if (!isAuthenticated) return;
    try {
      const data = await analyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }, [isAuthenticated]);

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
    loadHealth();
    if (isAuthenticated) {
      loadMetrics();
    }
    const interval = setInterval(() => {
      loadAnalytics();
      if (isAuthenticated) loadMetrics();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics, loadMetrics, loadHealth, isAuthenticated]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const promises: Promise<void>[] = [loadAnalytics(), loadHealth()];
    if (isAuthenticated) promises.push(loadMetrics());
    await Promise.all(promises);
  };

  // Flatten metrics for display
  const flattenedMetrics = useMemo(() => {
    if (!metrics?.metrics) return {};
    return flattenMetrics(metrics.metrics);
  }, [metrics]);

  if (isLoading || authLoading) {
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
    if (key.toLowerCase().includes('response') || key.toLowerCase().includes('latency') || key.toLowerCase().includes('duration')) return <Activity className="text-amber-400 h-4 w-4" />;
    if (key.toLowerCase().includes('cache')) return <Database className="text-sky-400 h-4 w-4" />;
    if (key.toLowerCase().includes('request') || key.toLowerCase().includes('counter')) return <TrendingUp className="text-violet-400 h-4 w-4" />;
    if (key.toLowerCase().includes('error')) return <AlertCircle className="text-red-400 h-4 w-4" />;
    return <Server className="text-sky-400 h-4 w-4" />;
  };

  const formatMetricValue = (value: unknown, key: string): string => {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('latency') || key.toLowerCase().includes('duration')) return `${value.toFixed(2)}ms`;
      if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage')) return `${value.toFixed(1)}%`;
      if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value > 1000) return `${(value / 1000).toFixed(1)}K`;
      if (Number.isInteger(value)) return value.toString();
      return value.toFixed(2);
    }
    if (typeof value === 'object' && value !== null) {
      // For histogram stats objects, show mean
      const obj = value as Record<string, unknown>;
      if (typeof obj.mean === 'number') {
        return `avg ${obj.mean.toFixed(2)}`;
      }
      return `${Object.keys(obj).length} items`;
    }
    if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
    return String(value);
  };

  const getStatusLabel = (value: number, label: string): { text: string; positive: boolean } => {
    if (label === 'Total Queries') {
      return value > 0 ? { text: 'Active', positive: true } : { text: 'No data', positive: false };
    }
    if (label === 'Unique Users') {
      return value > 0 ? { text: `${value} sessions`, positive: true } : { text: 'No data', positive: false };
    }
    if (label === 'Cache Hit Rate') {
      return value > 70 ? { text: 'Healthy', positive: true } : value > 0 ? { text: 'Low', positive: false } : { text: 'No data', positive: false };
    }
    if (label === 'Avg Response') {
      if (value === 0) return { text: 'No data', positive: false };
      return value < 500 ? { text: 'Fast', positive: true } : { text: 'Slow', positive: false };
    }
    return { text: '', positive: true };
  };

  const statCards = [
    {
      label: 'Total Queries',
      value: formatNumber(analytics?.total_queries || 0),
      rawValue: analytics?.total_queries || 0,
      subtext: 'all time',
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-600/10 to-sky-600/5',
      border: 'border-cyan-500/15',
    },
    {
      label: 'Unique Users',
      value: formatNumber(analytics?.unique_users || 0),
      rawValue: analytics?.unique_users || 0,
      subtext: 'distinct sessions',
      icon: Users,
      color: 'text-blue-400',
      bgGlow: 'from-blue-600/10 to-cyan-600/5',
      border: 'border-blue-500/15',
    },
    {
      label: 'Cache Hit Rate',
      value: `${hitRate}%`,
      rawValue: hitRate,
      subtext: hitRate > 70 ? 'target met ✓' : 'below target',
      icon: Zap,
      color: 'text-amber-400',
      bgGlow: 'from-amber-600/10 to-yellow-600/5',
      border: 'border-amber-500/15',
    },
    {
      label: 'Avg Response',
      value: `${analytics?.avg_response_time?.toFixed(0) || 0}ms`,
      rawValue: analytics?.avg_response_time || 0,
      subtext: 'per query',
      icon: Clock,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-600/10 to-teal-600/5',
      border: 'border-emerald-500/15',
    },
  ];

  const popularQuestions = Object.entries(analytics?.popular_questions || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const maxQueryCount = popularQuestions[0]?.[1] || 1;

  const flatMetricEntries = Object.entries(flattenedMetrics);

  return (
    <div className="min-h-screen py-3 sm:py-4 pb-8 sm:pb-10 px-3 sm:px-4 md:px-6 lg:px-8 relative">

      {/* Ambient background */}
      <div className="fixed top-0 right-0 w-[300px] sm:w-[400px] md:w-[600px] h-[250px] sm:h-[400px] md:h-[500px] bg-cyan-900/6 blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-sky-900/5 blur-[60px] sm:blur-[80px] md:blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 relative z-10">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl sm:rounded-2xl bg-white/3 border border-white/7 p-4 sm:p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-cyan-600/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/8 bg-white/4 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-white/50 mb-2 sm:mb-4">
                <BarChart3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-400" />
                Observability
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-clip-text text-transparent bg-linear-to-br from-white via-white/90 to-white/60 leading-tight">
                Analytics Dashboard
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/40 font-light">
                {isAuthenticated
                  ? 'Real-time system health and engagement telemetry'
                  : 'Platform overview and system health'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] text-white/40 hover:text-white/65 transition-colors px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/8"
              >
                <RefreshCw size={12} className={`text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                <span className="sm:hidden">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <Badge
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] border ${healthStatus === 'healthy'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : healthStatus === 'degraded'
                    ? 'bg-red-500/10 text-red-300 border-red-500/20'
                    : 'bg-white/5 text-white/40 border-white/10'
                  }`}
              >
                {healthStatus === 'healthy' ? (
                  <><CheckCircle2 size={11} className="mr-1 sm:mr-1.5" /> <span className="hidden sm:inline">System</span> Healthy</>
                ) : healthStatus === 'degraded' ? (
                  <><AlertCircle size={11} className="mr-1 sm:mr-1.5" /> Degraded</>
                ) : (
                  <><Info size={11} className="mr-1 sm:mr-1.5" /> Checking...</>
                )}
              </Badge>

              {isAuthenticated && (
                <ImportDataDialog onUploadSuccess={loadAnalytics} />
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Guest View ────────────────────────────────────────────── */}
        {!isAuthenticated ? (
          <GuestView
            analytics={analytics}
            healthStatus={healthStatus}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            onRefresh={handleManualRefresh}
          />
        ) : (
          <>
            {/* ── Authenticated View ────────────────────────────────── */}

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white/4 border border-white/6 rounded-lg sm:rounded-xl p-1 overflow-x-auto">
              {[
                { key: 'system' as const, label: 'System Metrics', shortLabel: 'System', icon: <Server size={14} className="shrink-0" /> },
                { key: 'insights' as const, label: 'Chat Insights', shortLabel: 'Insights', icon: <Sparkles size={14} className="shrink-0" /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.key
                    ? 'bg-white/8 text-white shadow-sm border border-white/10'
                    : 'text-white/40 hover:text-white/65 hover:bg-white/4'
                    }`}
                >
                  {tab.icon}
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Chat Insights Tab */}
            {activeTab === 'insights' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatInsights userId={user.id} />
              </motion.div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {statCards.map((card, i) => {
                    const status = getStatusLabel(card.rawValue, card.label);
                    return (
                      <motion.div
                        key={card.label}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className={`rounded-xl sm:rounded-2xl border ${card.border} bg-white/2 relative overflow-hidden group p-3 sm:p-4 md:p-5 hover:bg-white/4 transition-colors duration-300`}
                      >
                        <div className={`absolute inset-0 bg-linear-to-br ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="relative flex items-start justify-between mb-3 sm:mb-4 md:mb-5">
                          <div className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/6">
                            <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                          </div>
                          {status.text && (
                            <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full border ${status.positive ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400' : 'border-white/10 bg-white/5 text-white/40'
                              }`}>
                              {status.positive && <ArrowUpRight size={10} className="hidden sm:block" />}
                              <span>{status.text}</span>
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <p className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wider font-semibold">{card.label}</p>
                          <p className="text-xl sm:text-2xl md:text-[28px] font-bold text-white mt-0.5 sm:mt-1 tracking-tight leading-none">{card.value}</p>
                          <p className="text-[10px] sm:text-[11px] text-white/25 mt-1 sm:mt-1.5 font-light">{card.subtext}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

                  {/* System Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                    className="lg:col-span-2 rounded-xl sm:rounded-2xl bg-white/2 border border-white/7 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/6">
                      <h2 className="text-white font-semibold flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-[15px]">
                        <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400" />
                        System Metrics
                      </h2>
                      <Badge variant="outline" className="border-white/10 text-white/35 bg-white/3 text-[9px] sm:text-[10px]">
                        Auto-refresh 30s
                      </Badge>
                    </div>
                    <div className="p-3 sm:p-5">
                      {flatMetricEntries.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                          {flatMetricEntries.map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 p-3 sm:p-4 transition-colors group"
                            >
                              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 group-hover:bg-white/8 transition-colors shrink-0">
                                {getMetricIcon(key)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/30 font-semibold truncate">
                                  {key.replace(/[._]/g, ' ')}
                                </p>
                                <p className="text-[13px] sm:text-[15px] font-mono text-white/85 mt-0.5 truncate">
                                  {formatMetricValue(value, key)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-white/20">
                          <Server className="h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3 opacity-30" />
                          <p className="text-xs sm:text-sm">System metrics unavailable</p>
                          <p className="text-[10px] sm:text-xs mt-1 text-white/15">Metrics may be disabled in configuration</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Top Questions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.35 }}
                    className="rounded-xl sm:rounded-2xl bg-white/2 border border-white/7 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/6">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                        <h2 className="text-white font-semibold text-[13px] sm:text-[15px]">Top Questions</h2>
                      </div>
                      {popularQuestions.length > 0 && (
                        <Badge variant="outline" className="border-amber-500/20 text-amber-400/60 bg-amber-500/5 text-[9px] sm:text-[10px]">
                          {popularQuestions.length} queries
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      {popularQuestions.length > 0 ? (
                        <div className="space-y-1.5 sm:space-y-2">
                          {popularQuestions.map(([q, count], i) => (
                            <div
                              key={q}
                              className="group flex items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-white/5 hover:border-white/9 bg-white/2 hover:bg-white/5 px-3 sm:px-4 py-2 sm:py-3 transition-all"
                            >
                              <span className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[9px] sm:text-[10px] text-amber-300 font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] sm:text-[12px] text-white/65 leading-snug font-light line-clamp-2">{q}</p>
                                <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2">
                                  <div className="flex-1 h-0.5 sm:h-1 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-linear-to-r from-amber-500/60 to-amber-400/40 transition-all duration-700"
                                      style={{ width: `${(count / maxQueryCount) * 100}%` }}
                                    />
                                  </div>
                                  <p className="text-[9px] sm:text-[10px] text-white/25 shrink-0">{count}×</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-white/20">
                          <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-30" />
                          <p className="text-xs sm:text-sm">No query data yet</p>
                          <p className="text-[10px] sm:text-xs mt-1 text-white/15">Questions will appear as users interact</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

                  {/* Ops Notes */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.45 }}
                    className="lg:col-span-3 rounded-xl sm:rounded-2xl bg-white/2 border border-white/7 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-white/6">
                      <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400" />
                      <h2 className="text-white font-semibold text-[13px] sm:text-[15px]">Operations</h2>
                    </div>
                    <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                      <div className="rounded-lg sm:rounded-xl border border-white/7 bg-white/2 p-3 sm:p-4">
                        <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-white/30 mb-1 sm:mb-1.5">Config</span>
                        <span className="text-[12px] sm:text-[13px] text-white/55 font-light">Refresh interval: 30 seconds</span>
                      </div>
                      <div className="rounded-lg sm:rounded-xl border border-white/7 bg-white/2 p-3 sm:p-4">
                        <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-white/30 mb-1 sm:mb-1.5">Cache Target</span>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                          <div className="flex-1 h-1 sm:h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${hitRate > 70 ? 'bg-linear-to-r from-emerald-500 to-cyan-500' : 'bg-linear-to-r from-amber-500 to-orange-500'}`}
                              style={{ width: `${Math.min(hitRate, 100)}%` }}
                            />
                          </div>
                          <span className={`text-[11px] sm:text-[12px] font-mono shrink-0 ${hitRate > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{hitRate}%</span>
                        </div>
                        <div className="flex justify-between text-[10px] sm:text-[11px] mt-1 sm:mt-1.5">
                          <span className="text-white/25">Hits: {analytics?.cache_hits || 0}</span>
                          <span className="text-white/25">Misses: {analytics?.cache_misses || 0}</span>
                        </div>
                      </div>

                      <div className="rounded-lg sm:rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-2.5">
                          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-cyan-300/50 mb-0.5 sm:mb-1">Pro Tip</span>
                            <span className="text-[11px] sm:text-[12px] text-cyan-200/55 font-light leading-relaxed">
                              Use import to backfill historical insights.
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        variant="outline"
                        className="w-full border-white/8 bg-white/3 text-white/50 hover:bg-white/8 hover:text-white/80 text-[12px] sm:text-[13px] gap-1.5 sm:gap-2 transition-all"
                      >
                        <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
