import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-xl backdrop-blur-sm">
      {/* Background with grid pattern */}
      <div className="absolute inset-0 bg-black/10 dark:bg-white/5">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '10px 10px'
          }}
        ></div>
      </div>

      {/* Glowing accent line */}
      <div className="absolute top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      {/* Progress fill */}
      <div
        className="relative h-full rounded-xl animate-pulse-subtle"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, hsl(var(--primary) / 0.8), hsl(var(--primary)))`,
          boxShadow: `0 0 15px 1px hsl(var(--primary) / 0.6)`,
        }}
      >
        {/* Moving light effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>

        {/* Progress percentage marker */}
        {progress >= 10 && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/90">
            {progress}%
          </div>
        )}
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </div>
  );
};

export { ProgressBar };
