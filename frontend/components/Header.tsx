import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
}

export function Header({ isOnline }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-orange-200/50 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Sacred Om Symbol */}
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 shadow-lg ring-2 ring-orange-200/50">
                <span className="text-lg font-bold text-white">ॐ</span>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 animate-pulse"></div>
            </div>

            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                भगवद् गीता AI
              </h1>
              <p className="text-xs text-gray-600 font-medium">Divine Spiritual Intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200/50 shadow-sm">
              <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-red-500 shadow-red-500/50 shadow-lg'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative border */}
      <div className="h-px bg-gradient-to-r from-transparent via-orange-300/30 to-transparent"></div>
    </header>
  );
}
