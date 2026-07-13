import React, { useEffect, useState } from 'react';

interface AIEngineLiveProps {
  isScanning: boolean;
}

export default function AIEngineLive({ isScanning }: AIEngineLiveProps) {
  const [bars, setBars] = useState<number[]>(Array(6).fill(20));

  useEffect(() => {
    const intervalTime = isScanning ? 100 : 600;

    const interval = setInterval(() => {
      setBars(prev => prev.map(() =>
        isScanning
          ? Math.random() * 80 + 20
          : Math.random() * 30 + 10
      ));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-500 overflow-hidden relative ${isScanning
      ? 'bg-fuchsia-100 dark:bg-fuchsia-950/40 border-fuchsia-400 dark:border-fuchsia-500/40 shadow-md shadow-fuchsia-200 dark:shadow-fuchsia-900/30'
      : 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/20 shadow-sm'
      }`}>
      {/* Background shimmer sweep when scanning */}
      {isScanning && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/15 dark:via-fuchsia-500/10 to-transparent animate-[shimmer_2s_infinite]" />
      )}

      {/* Status dot */}
      <div className={`h-2 w-2 rounded-full shrink-0 relative z-10 transition-colors duration-500 ${isScanning ? 'bg-fuchsia-500 animate-ping' : 'bg-emerald-500 animate-pulse'
        }`} />

      {/* Label text */}
      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest relative z-10 transition-colors duration-500 whitespace-nowrap ${isScanning
        ? 'text-fuchsia-700 dark:text-fuchsia-300 dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]'
        : 'text-emerald-700 dark:text-emerald-400'
        }`}>
        AI Engine Live
      </span>

      {/* ECG Waveform Bars - bên phải chữ */}
      <div className="flex items-center gap-[2px] h-4 shrink-0 relative z-10">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`w-[2.5px] rounded-full transition-all ease-out ${isScanning
              ? 'bg-fuchsia-500 dark:bg-fuchsia-400'
              : 'bg-emerald-500 dark:bg-emerald-500/80'
              }`}
            style={{
              height: `${height}%`,
              transitionDuration: isScanning ? '80ms' : '400ms'
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
