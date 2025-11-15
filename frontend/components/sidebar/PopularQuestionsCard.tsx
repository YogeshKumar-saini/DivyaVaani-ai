import { Badge } from "@/components/ui/badge";
import { MessageCircle, TrendingUp, Clock, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import { AnalyticsData } from "@/lib/api/analytics-service";

interface PopularQuestionsCardProps {
  analytics: AnalyticsData | null;
  onQuestionClick?: (question: string) => void;
  onFavoriteToggle?: (question: string) => void;
}

export function PopularQuestionsCard({
  analytics,
  onQuestionClick,
  onFavoriteToggle
}: PopularQuestionsCardProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const handleFavoriteClick = (question: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(question)) {
      newFavorites.delete(question);
    } else {
      newFavorites.add(question);
    }
    setFavorites(newFavorites);
    onFavoriteToggle?.(question);
  };

  const getPopularityIcon = (rank: number) => {
    switch (rank) {
      case 0: return <Star className="w-3 h-3 text-yellow-500" />;
      case 1: return <TrendingUp className="w-3 h-3 text-orange-500" />;
      case 2: return <MessageCircle className="w-3 h-3 text-blue-500" />;
      default: return <MessageCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getPopularityBadgeColor = (rank: number) => {
    switch (rank) {
      case 0: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 1: return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300';
      case 2: return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="sidebar-card bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-orange-200/30 sidebar-entrance sidebar-scrollable">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-orange-800 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-orange-600 icon-rotate" />
          Popular Questions
        </h3>
        <Badge variant="outline" className="text-xs sidebar-badge border-orange-200">
          {analytics?.top_questions?.length || 0} topics
        </Badge>
      </div>
      
      <div className="space-y-2">
        {analytics?.top_questions?.length ? (
          analytics.top_questions.slice(0, 6).map(([question, count], idx) => (
            <div
              key={idx}
              className={`group relative p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg hover:from-orange-100 hover:to-yellow-100 transition-all duration-200 cursor-pointer border border-orange-200 hover:border-orange-300 ${
                hoveredItem === idx ? 'transform scale-[1.02]' : ''
              }`}
              onClick={() => onQuestionClick?.(question)}
              onMouseEnter={() => setHoveredItem(idx)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    {getPopularityIcon(idx)}
                    <span className="text-xs text-gray-500 ml-1 font-medium">
                      #{idx + 1}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed mb-2">
                    {question.length > 45 ? `${question.substring(0, 45)}...` : question}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-medium ${getPopularityBadgeColor(idx)}`}
                      >
                        {count}×
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Trending</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => handleFavoriteClick(question, e)}
                        className={`p-1 rounded transition-colors duration-200 ${
                          favorites.has(question)
                            ? 'text-orange-500 hover:text-orange-600'
                            : 'text-gray-400 hover:text-orange-500'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${favorites.has(question) ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button className="p-1 rounded text-gray-400 hover:text-orange-500 transition-colors duration-200">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-red-400 rounded-l-lg transition-opacity duration-200 ${
                hoveredItem === idx ? 'opacity-100' : 'opacity-0'
              }`}></div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-500 font-medium">No questions yet</div>
            <div className="text-xs text-gray-400 mt-1">
              Be the first to ask a question
            </div>
            <div className="mt-3 p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-600">
                💡 Try asking about dharma, karma, or spiritual guidance
              </div>
            </div>
          </div>
        )}
      </div>
      
      {analytics?.top_questions?.length && analytics.top_questions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-orange-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Most popular this week</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-1 animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium text-gray-800">{analytics.top_questions[0]?.[1] || 0} people</span> are asking about
            <span className="font-medium text-orange-600 ml-1">
              &ldquo;{analytics.top_questions[0]?.[0]?.substring(0, 20)}...&rdquo;
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
