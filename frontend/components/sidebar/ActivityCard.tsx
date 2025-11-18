import { useState, useEffect } from "react";
import {
  Activity,
  Zap,
  Database,
  Globe,
  Clock,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Heart,
  Share2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: 'query' | 'cache' | 'analytics' | 'system' | 'user' | 'error' | 'feedback' | 'search';
  message: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: {
    responseTime?: number;
    language?: string;
    userId?: string;
    question?: string;
    details?: string;
  };
}

interface ActivityCardProps {
  activities?: ActivityItem[];
  isLive?: boolean;
  maxItems?: number;
}

export function ActivityCard({
  activities = [],
  isLive = true,
  maxItems = 8
}: ActivityCardProps) {
  const [displayActivities, setDisplayActivities] = useState<ActivityItem[]>(activities);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for relative timestamps
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Update display activities when activities prop changes
  useEffect(() => {
    setDisplayActivities(activities);
  }, [activities]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClass = "w-3 h-3";
    
    switch (type) {
      case 'query':
        return <Globe className={iconClass} />;
      case 'cache':
        return <Zap className={iconClass} />;
      case 'analytics':
        return <BarChart3 className={iconClass} />;
      case 'system':
        return <Database className={iconClass} />;
      case 'user':
        return <Activity className={iconClass} />;
      case 'feedback':
        return <Heart className={iconClass} />;
      case 'search':
        return <Share2 className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  const getStatusBgColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getTypeBadgeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'query':
        return 'bg-blue-100 text-blue-800';
      case 'cache':
        return 'bg-purple-100 text-purple-800';
      case 'analytics':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'user':
        return 'bg-indigo-100 text-indigo-800';
      case 'feedback':
        return 'bg-pink-100 text-pink-800';
      case 'search':
        return 'bg-orange-100 text-orange-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const diffInMinutes = Math.floor((currentTime.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'query': return 'Query';
      case 'cache': return 'Cache';
      case 'analytics': return 'Analytics';
      case 'system': return 'System';
      case 'user': return 'User';
      case 'feedback': return 'Feedback';
      case 'search': return 'Search';
      case 'error': return 'Error';
      default: return 'Activity';
    }
  };

  return (
    <div className="sidebar-card bg-white/25 backdrop-blur-2xl saturate-150 rounded-xl p-4 shadow-lg border border-white/30 sidebar-entrance sidebar-scrollable hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-blue-500 icon-rotate" />
          Recent Activity
        </h3>
        <div className="flex items-center space-x-2">
          {isLive && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-custom"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          )}
          <RefreshCw className="w-3 h-3 text-gray-400 icon-rotate" />
        </div>
      </div>
      
      <div className="space-y-3">
        {displayActivities.slice(0, maxItems).map((activity) => (
          <div
            key={activity.id}
            className="group p-3 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-200"
          >
            <div className="flex items-start space-x-3">
              {/* Status indicator */}
              <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getTypeBadgeColor(activity.type)}`}
                  >
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-700 leading-relaxed mb-1">
                  {activity.message}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {activity.metadata?.responseTime && (
                      <span className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        {activity.metadata.responseTime}ms
                      </span>
                    )}
                    {activity.metadata?.language && (
                      <Badge variant="outline" className="text-xs">
                        {activity.metadata.language.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusBgColor(activity.status)}`}></div>
                </div>
                
                {activity.metadata?.details && (
                  <div className="mt-1 text-xs text-gray-500 italic">
                    {activity.metadata.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {displayActivities.length === 0 && (
          <div className="text-center py-6">
            <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-sm text-gray-500 font-medium">No activity yet</div>
            <div className="text-xs text-gray-400 mt-1">
              Activity will appear here as users interact
            </div>
          </div>
        )}
      </div>
      
      {displayActivities.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {displayActivities.length} activities
            </span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Success</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Info</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                <span>Warning</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
