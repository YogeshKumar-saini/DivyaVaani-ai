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
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  FlashOn as FlashIcon,
  AccessTime as AccessTimeIcon,
  BarChart as BarChartIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
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
      // Set fallback data when API fails
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
    if (key.toLowerCase().includes('cpu')) return <MemoryIcon color="primary" />;
    if (key.toLowerCase().includes('memory') || key.toLowerCase().includes('ram')) return <StorageIcon color="success" />;
    if (key.toLowerCase().includes('response') || key.toLowerCase().includes('latency')) return <TimelineIcon color="warning" />;
    return <BarChartIcon color="secondary" />;
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
        return `${value.length} items`;
      }
      const keys = Object.keys(value);
      if (keys.length === 1) {
        const firstKey = keys[0];
        const firstValue = (value as Record<string, unknown>)[firstKey];
        if (typeof firstValue === 'number') {
          return formatMetricValue(firstValue, firstKey);
        }
        return `${firstKey}: ${String(firstValue)}`;
      }
      return `${keys.length} properties`;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return String(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          System usage and performance metrics
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Total
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
            {formatNumber(analytics?.total_queries || 0)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Queries
          </Typography>
        </Card>

        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <PeopleIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Active
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
            {formatNumber(analytics?.unique_users || 0)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Users
          </Typography>
        </Card>

        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <FlashIcon sx={{ fontSize: 32, color: 'warning.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Rate
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'warning.main' }}>
            {analytics && (analytics.cache_hits + analytics.cache_misses) > 0
              ? Math.round((analytics.cache_hits / (analytics.cache_hits + analytics.cache_misses)) * 100)
              : 0}%
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Cache Hit
          </Typography>
        </Card>

        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 32, color: 'error.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Avg
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
            {analytics?.avg_response_time?.toFixed(0) || 0}ms
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Response Time
          </Typography>
        </Card>
      </Box>

      {/* Popular Questions */}
      {analytics?.popular_questions && Object.keys(analytics.popular_questions).length > 0 && (
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
            Popular Questions
          </Typography>
          <List>
            {Object.entries(analytics.popular_questions).slice(0, 10).map(([question, count], idx) => (
              <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                <ListItemText
                  primary={question}
                  secondary={`${count}×`}
                  primaryTypographyProps={{ sx: { color: 'text.primary' } }}
                  secondaryTypographyProps={{ sx: { color: 'primary.main', fontWeight: 'bold' } }}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* System Metrics */}
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AnalyticsIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              System Metrics
            </Typography>
          </Box>
          {metricsLoading && <LinearProgress sx={{ width: 100 }} />}
        </Box>

        {metrics ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            {Object.entries(metrics.metrics).map(([key, value], idx) => (
              <Card variant="outlined" key={idx} sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  {getMetricIcon(key)}
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                    {key.replace(/_/g, ' ')}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {formatMetricValue(value, key)}
                </Typography>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <BarChartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Metrics data not available
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1 }}>
              System metrics will appear here when available
            </Typography>
          </Box>
        )}

        {metrics && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
              Last updated: {metrics.timestamp > 0
                ? new Date(metrics.timestamp * 1000).toLocaleString()
                : new Date().toLocaleString()}
            </Typography>
          </Box>
        )}
      </Card>

      {/* Feedback Section */}
      <Box sx={{ mt: 4 }}>
        <FeedbackForm />
      </Box>
    </Container>
  );
}
