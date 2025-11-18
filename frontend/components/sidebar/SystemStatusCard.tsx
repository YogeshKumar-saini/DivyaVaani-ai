import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Database,
  Wifi,
  Shield,
  Clock,
  Globe,
  Zap,
  Server,
  Activity,
  CheckCircle,
  XCircle
} from "lucide-react";

interface SystemStatusCardProps {
  isOnline: boolean;
  systemInfo?: {
    model?: string;
    version?: string;
    uptime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    storageUsed?: number;
    lastUpdate?: Date;
    apiCalls?: number;
    errorRate?: number;
  };
}

export function SystemStatusCard({
  isOnline,
  systemInfo
}: SystemStatusCardProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusIcon = (isOnline: boolean) => {
    if (isOnline) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? "default" : "destructive";
  };

  const getUsageColor = (usage: number) => {
    if (usage < 60) return "text-green-600";
    if (usage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getUsageBarColor = (usage: number) => {
    if (usage < 60) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="sidebar-card bg-white/25 backdrop-blur-2xl saturate-150 rounded-xl p-4 shadow-lg border border-white/30 sidebar-entrance sidebar-scrollable hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-orange-800 flex items-center">
          <Server className="w-4 h-4 mr-2 text-orange-600 icon-rotate" />
          System Status
        </h3>
        <div className="flex items-center space-x-1">
          {getStatusIcon(isOnline)}
          <Badge variant={getStatusColor(isOnline)} className="text-xs">
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Core System Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center">
              <Cpu className="w-3 h-3 mr-1" />
              AI Model
            </span>
            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
              {systemInfo?.model || 'Unknown'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              Version
            </span>
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
              {systemInfo?.version || '1.0.0'}
            </Badge>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center">
              <Activity className="w-3 h-3 mr-1" />
              CPU Usage
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getUsageBarColor(systemInfo?.cpuUsage || 0)}`}
                  style={{ width: `${systemInfo?.cpuUsage || 0}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${getUsageColor(systemInfo?.cpuUsage || 0)}`}>
                {systemInfo?.cpuUsage || 0}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center">
              <Database className="w-3 h-3 mr-1" />
              Memory
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getUsageBarColor(systemInfo?.memoryUsage || 0)}`}
                  style={{ width: `${systemInfo?.memoryUsage || 0}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${getUsageColor(systemInfo?.memoryUsage || 0)}`}>
                {systemInfo?.memoryUsage || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Network & Storage */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center">
              <Wifi className="w-3 h-3 mr-1" />
              API Calls
            </span>
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              {systemInfo?.apiCalls?.toLocaleString() || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Errors
            </span>
            <Badge
              variant={systemInfo?.errorRate && systemInfo.errorRate > 5 ? "destructive" : "secondary"}
              className="text-xs bg-orange-100 text-orange-700"
            >
              {(systemInfo?.errorRate || 0).toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Uptime & Updates */}
        <div className="pt-2 border-t border-orange-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Uptime
              </span>
              <span className="text-xs font-medium text-gray-800">
                {formatUptime(systemInfo?.uptime || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Last Update
              </span>
              <span className="text-xs font-medium text-gray-800">
                {systemInfo?.lastUpdate ?
                  new Intl.DateTimeFormat('en', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(systemInfo.lastUpdate) : 'Just now'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="pt-2 border-t border-orange-200">
          <div className="flex items-center justify-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`}></div>
            <div className="text-xs text-gray-500 text-center">
              {isOnline ? (
                <>
                  <span className="text-orange-600 font-medium">All systems operational</span>
                  <br />
                  <span>Powered by advanced RAG technology</span>
                </>
              ) : (
                <span className="text-red-600 font-medium">System maintenance required</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
