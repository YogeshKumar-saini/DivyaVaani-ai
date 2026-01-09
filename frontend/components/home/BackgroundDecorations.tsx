export function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {/* Subtle Sacred Symbols */}
      <div className="absolute top-[15%] left-[8%] text-6xl text-primary animate-[gentleFloat_8s_ease-in-out_infinite]">
        ॐ
      </div>

      <div className="absolute top-[30%] right-[12%] text-4xl text-secondary animate-[gentleFloat_10s_ease-in-out_infinite_reverse]">
        🪷
      </div>

      <div className="absolute bottom-[25%] left-[15%] text-6xl text-yellow-500 animate-[gentleFloat_12s_ease-in-out_infinite]">
        ❖
      </div>

      {/* Minimal Sacred Geometry */}
      <div className="absolute top-[40%] left-[25%] h-2 w-2 rounded-full bg-primary animate-[slowPulse_6s_ease-in-out_infinite]" />

      <div className="absolute bottom-[35%] right-[30%] h-1.5 w-1.5 rounded-full bg-secondary animate-[slowPulse_8s_ease-in-out_infinite_reverse]" />

      <div className="absolute top-[60%] left-[40%] h-1 w-1 rounded-full bg-yellow-500 animate-[slowPulse_10s_ease-in-out_infinite]" />

      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes slowPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
