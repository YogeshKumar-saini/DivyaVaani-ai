import { Badge } from "@/components/ui/badge";
import { Clock, Search, Heart, Share2 } from "lucide-react";

interface HistoryItem {
  id: string;
  question: string;
  timestamp: Date;
  language: string;
  isFavorite?: boolean;
  hasShared?: boolean;
}

interface SearchHistoryCardProps {
  history?: HistoryItem[];
  onQuestionClick?: (question: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export function SearchHistoryCard({ 
  history = [], 
  onQuestionClick, 
  onToggleFavorite 
}: SearchHistoryCardProps) {
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getLanguageColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'en': return 'bg-blue-100 text-blue-800';
      case 'hi': return 'bg-orange-100 text-orange-800';
      case 'sa': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="sidebar-card bg-white/25 backdrop-blur-2xl saturate-150 rounded-xl p-4 shadow-lg border border-white/30 sidebar-entrance sidebar-scrollable hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center">
        <Clock className="w-4 h-4 mr-2 text-orange-600 icon-rotate" />
        Recent Searches
      </h3>
      
      <div className="space-y-3">
        {history.length > 0 ? (
          history.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="group p-3 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg hover:from-orange-100 hover:to-blue-100 transition-all duration-200 cursor-pointer border border-orange-200/50"
              onClick={() => onQuestionClick?.(item.question)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                    {item.question}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(item.timestamp)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getLanguageColor(item.language)}`}
                    >
                      {item.language.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(item.id);
                    }}
                    className={`p-1 rounded transition-colors duration-200 ${
                      item.isFavorite
                        ? 'text-orange-500 hover:text-orange-600'
                        : 'text-gray-400 hover:text-orange-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  {item.hasShared && (
                    <Share2 className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-xs text-gray-500">No search history yet</div>
            <div className="text-xs text-gray-400 mt-1">
              Your questions will appear here
            </div>
          </div>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="text-xs text-gray-500 text-center">
            Showing {Math.min(history.length, 5)} of {history.length} searches
          </div>
        </div>
      )}
    </div>
  );
}
