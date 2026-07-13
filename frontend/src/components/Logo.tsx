import React from 'react';

interface LogoProps {
  isScanning?: boolean;
}

export default function Logo({ isScanning = false }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-700 overflow-hidden group border ${isScanning
        ? 'border-fuchsia-400/50 shadow-[0_0_25px_rgba(217,70,239,0.35)]'
        : 'border-blue-200 dark:border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
      }`}>
      {/* SVG Logo */}
      <svg viewBox="0 0 80 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradIdle" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="logoGradScan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="logoGlowStrong">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background - uses CSS class for light/dark */}
        <rect x="0" y="0" width="80" height="80" rx="14" className="logo-bg" />

        {/* Outer hexagonal radar frame - rotates */}
        <g style={{ transformOrigin: '40px 40px', animation: `logoSpin ${isScanning ? '2s' : '8s'} linear infinite` }}>
          <polygon
            points="40,8 66,22 66,58 40,72 14,58 14,22"
            fill="none"
            className={isScanning ? 'stroke-fuchsia-500/30' : 'stroke-blue-400/60 dark:stroke-blue-400/25'}
            strokeWidth="1"
            strokeDasharray="4 3"
          />
        </g>

        {/* Inner hexagonal ring - counter-rotates */}
        <g style={{ transformOrigin: '40px 40px', animation: `logoSpinReverse ${isScanning ? '3s' : '12s'} linear infinite` }}>
          <polygon
            points="40,16 58,28 58,52 40,64 22,52 22,28"
            fill="none"
            className={isScanning ? 'stroke-pink-500/35' : 'stroke-cyan-400/50 dark:stroke-cyan-400/20'}
            strokeWidth="0.8"
          />
        </g>

        {/* Radar sweep line */}
        <g style={{ transformOrigin: '40px 40px', animation: `logoSpin ${isScanning ? '1s' : '4s'} linear infinite` }}>
          <line x1="40" y1="40" x2="40" y2="14"
            className={isScanning ? 'stroke-fuchsia-500' : 'stroke-blue-400'}
            strokeWidth="1.2" strokeLinecap="round" opacity="0.8"
          />
          <circle cx="40" cy="16" r="1.8"
            className={isScanning ? 'fill-fuchsia-300' : 'fill-blue-300 dark:fill-blue-200'}
            filter="url(#logoGlow)"
          />
        </g>

        {/* Central Shield */}
        <g filter="url(#logoGlow)">
          <path
            d="M40,22 L52,28 L52,42 C52,50 46,56 40,58 C34,56 28,50 28,42 L28,28 Z"
            fill="none"
            stroke={`url(#${isScanning ? 'logoGradScan' : 'logoGradIdle'})`}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Shield cross lines */}
          <line x1="40" y1="30" x2="40" y2="50"
            className={isScanning ? 'stroke-fuchsia-500/40' : 'stroke-blue-500/30'}
            strokeWidth="0.8" strokeLinecap="round"
          />
          <line x1="33" y1="38" x2="47" y2="38"
            className={isScanning ? 'stroke-fuchsia-500/30' : 'stroke-blue-500/20'}
            strokeWidth="0.8" strokeLinecap="round"
          />
          {/* AI chip dots */}
          <circle cx="36" cy="34" r="1.2" className={isScanning ? 'fill-fuchsia-400' : 'fill-blue-500 dark:fill-blue-400'} opacity="0.8" />
          <circle cx="44" cy="34" r="1.2" className={isScanning ? 'fill-pink-400' : 'fill-cyan-500 dark:fill-cyan-400'} opacity="0.8" />
          <circle cx="36" cy="44" r="1.2" className={isScanning ? 'fill-purple-400' : 'fill-indigo-500 dark:fill-indigo-400'} opacity="0.6" />
          <circle cx="44" cy="44" r="1.2" className={isScanning ? 'fill-pink-300' : 'fill-emerald-500 dark:fill-emerald-400'} opacity="0.6" />
          {/* Center core */}
          <circle cx="40" cy="39" r="2.2"
            className={isScanning ? 'fill-fuchsia-300' : 'fill-blue-400 dark:fill-blue-300'}
            filter="url(#logoGlowStrong)"
          >
            {!isScanning && <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />}
          </circle>
        </g>

        {/* Orbiting particles when scanning */}
        {isScanning && (
          <>
            <circle cx="0" cy="0" r="1.2" fill="#d946ef" opacity="0.9" filter="url(#logoGlow)">
              <animateMotion dur="1.5s" repeatCount="indefinite"
                path="M40,8 L66,22 L66,58 L40,72 L14,58 L14,22 Z" />
            </circle>
            <circle cx="0" cy="0" r="0.9" fill="#ec4899" opacity="0.7" filter="url(#logoGlow)">
              <animateMotion dur="2.2s" repeatCount="indefinite"
                path="M40,16 L58,28 L58,52 L40,64 L22,52 L22,28 Z" />
            </circle>
          </>
        )}

        {/* Scan beam when scanning */}
        {isScanning && (
          <rect x="28" y="0" width="24" height="2" rx="1" fill="white" opacity="0.15" filter="url(#logoGlow)">
            <animate attributeName="y" from="18" to="62" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.3;0.3;0" dur="1.2s" repeatCount="indefinite" />
          </rect>
        )}

        {/* Corner accent dots */}
        <circle cx="14" cy="14" r="1" className={isScanning ? 'fill-fuchsia-500' : 'fill-blue-500 dark:fill-blue-400'} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="66" cy="14" r="1" className={isScanning ? 'fill-pink-500' : 'fill-cyan-500 dark:fill-cyan-400'} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="14" cy="66" r="1" className={isScanning ? 'fill-purple-500' : 'fill-indigo-500 dark:fill-indigo-400'} opacity="0.3">
          <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="66" cy="66" r="1" className={isScanning ? 'fill-pink-400' : 'fill-sky-500 dark:fill-sky-400'} opacity="0.3">
          <animate attributeName="opacity" values="0.15;0.5;0.15" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes logoSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes logoSpinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .logo-bg { fill: #eef4ff; }
        .dark .logo-bg { fill: #0c1929; }
      `}} />
    </div>
  );
}
