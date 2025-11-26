'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/api/analytics-service';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FeedbackForm } from '@/components/shared/FeedbackForm';
import { formatNumber } from '@/lib/utils/formatting';
import {
  Container,
  Box,
  Typography,
  Card,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  FlashOn as FlashIcon,
  AccessTime as AccessTimeIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Equalizer as EqualizerIcon,
  Assessment as AssessmentIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';

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
  const [metricsLoading, setMetricsLoading] = useState(false);

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
      setMetricsLoading(true);
      const data = await analyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="spiritual" text="Loading analytics..." />
      </div>
    );
  }

  const getMetricIcon = (key: string) => {
    if (key.toLowerCase().includes('cpu')) return <MemoryIcon sx={{ color: 'primary.main' }} />;
    if (key.toLowerCase().includes('memory') || key.toLowerCase().includes('ram')) return <StorageIcon sx={{ color: 'success.main' }} />;
    if (key.toLowerCase().includes('response') || key.toLowerCase().includes('latency')) return <TimelineIcon sx={{ color: 'warning.main' }} />;
    if (key.toLowerCase().includes('cache')) return <CloudIcon sx={{ color: 'info.main' }} />;
    return <AssessmentIcon sx={{ color: 'secondary.main' }} />;
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
      // For complex objects like histograms, show a summary
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
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            System performance and usage metrics
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Chip size="small" label="Live" color="success" />
            <Chip size="small" label="Auto-refresh" variant="outlined" />
          </Box>
        </Box>

        {/* Metrics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          <Card sx={{ p: 2, textAlign: 'center', '&:hover': { elevation: 4 } }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}><TrendingUpIcon /></Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
              {formatNumber(analytics?.total_queries || 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Queries</Typography>
          </Card>

          <Card sx={{ p: 2, textAlign: 'center', '&:hover': { elevation: 4 } }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}><PeopleIcon /></Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 0.5 }}>
              {formatNumber(analytics?.unique_users || 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Users</Typography>
          </Card>

          <Card sx={{ p: 2, textAlign: 'center', '&:hover': { elevation: 4 } }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}><FlashIcon /></Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5 }}>
              {analytics && (analytics.cache_hits + analytics.cache_misses) > 0
                ? Math.round((analytics.cache_hits / (analytics.cache_hits + analytics.cache_misses)) * 100)
                : 0}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cache Hit</Typography>
          </Card>

          <Card sx={{ p: 2, textAlign: 'center', '&:hover': { elevation: 4 } }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}><AccessTimeIcon /></Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 0.5 }}>
              {analytics?.avg_response_time?.toFixed(0) || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Response(ms)</Typography>
          </Card>
        </Box>

        {/* System Metrics */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <EqualizerIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              System Performance
            </Typography>
          </Box>

          {metrics ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {Object.entries(metrics.metrics).map(([key, value], idx) => (
                <Paper key={idx} sx={{ p: 2, textAlign: 'center', elevation: 1 }}>
                  {getMetricIcon(key)}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, mb: 0.5 }}>
                    {formatMetricValue(value, key)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssessmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                System metrics not available
              </Typography>
            </Box>
          )}
        </Card>

        {/* Feedback */}
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Help Improve Our Service
            </Typography>
            <FeedbackForm />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
