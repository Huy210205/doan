import React from 'react';

interface LogoProps {
  isScanning?: boolean;
  size?: number;
}

export default function Logo({ isScanning = false, size = 40 }: LogoProps) {
  const scanColor1 = '#d946ef';
  const scanColor2 = '#8b5cf6';
  const idleColor1 = '#3b82f6';
  const idleColor2 = '#06b6d4';

  const c1 = isScanning ? scanColor1 : idleColor1;
  const c2 = isScanning ? scanColor2 : idleColor2;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center shrink-0"
    >
      <svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          {/* Main gradient */}
          <linearGradient id="lgMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>

          {/* Glow filter — soft */}
          <filter id="lgGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter — strong for outer hex */}
          <filter id="lgGlowOuter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip to hex shape */}
          <clipPath id="hexClip">
            <polygon points="40,6 70,22 70,58 40,74 10,58 10,22" />
          </clipPath>
        </defs>

        {/* ── Outer subtle hex ring (spinning slowly) ── */}
        <g style={{ transformOrigin: '40px 40px', animation: `logoHexSpin ${isScanning ? '3s' : '12s'} linear infinite` }}>
          <polygon
            points="40,4 72,21 72,59 40,76 8,59 8,21"
            fill="none"
            stroke={`url(#lgMain)`}
            strokeWidth="0.8"
            strokeDasharray="6 5"
            opacity="0.35"
            filter="url(#lgGlowOuter)"
          />
        </g>

        {/* ── Background hex fill ── */}
        <polygon
          points="40,9 68,24 68,56 40,71 12,56 12,24"
          clipPath="url(#hexClip)"
          className="logo-bg-hex"
        />

        {/* ── Main hex border ── */}
        <polygon
          points="40,9 68,24 68,56 40,71 12,56 12,24"
          fill="none"
          stroke={`url(#lgMain)`}
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#lgGlow)"
          opacity={isScanning ? 1 : 0.9}
        />

        {/* ── Inner hex subtle ── */}
        <polygon
          points="40,16 62,28 62,52 40,64 18,52 18,28"
          fill="none"
          stroke={c2}
          strokeWidth="0.6"
          opacity="0.2"
        />

        {/* ── Letter W — bold, gradient filled ── */}
        <text
          x="40"
          y="51"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
          fontWeight="900"
          fontSize="32"
          letterSpacing="-1"
          fill={`url(#lgMain)`}
          filter="url(#lgGlow)"
        >
          W
        </text>

        {/* ── Corner bracket accents ── */}
        {/* top-left */}
        <path d="M16,26 L12,24 L14,20" fill="none" stroke={c1} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        {/* top-right */}
        <path d="M64,26 L68,24 L66,20" fill="none" stroke={c2} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        {/* bottom-left */}
        <path d="M16,54 L12,56 L14,60" fill="none" stroke={c1} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        {/* bottom-right */}
        <path d="M64,54 L68,56 L66,60" fill="none" stroke={c2} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

        {/* ── Scan beam (only while scanning) ── */}
        {isScanning && (
          <rect x="12" y="0" width="56" height="2.5" rx="1.2" fill="white" opacity="0" filter="url(#lgGlow)">
            <animate attributeName="y" from="14" to="66" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.25;0.25;0" dur="1.4s" repeatCount="indefinite" />
          </rect>
        )}

        {/* ── Orbiting dot (idle: slow pulse, scanning: orbits fast) ── */}
        {isScanning ? (
          <circle r="2" fill={c1} filter="url(#lgGlow)" opacity="0.9">
            <animateMotion
              dur="1.8s"
              repeatCount="indefinite"
              path="M40,9 L68,24 L68,56 L40,71 L12,56 L12,24 Z"
            />
          </circle>
        ) : (
          <circle cx="68" cy="40" r="1.8" fill={c2} filter="url(#lgGlow)" opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite" />
          </circle>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes logoHexSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          .logo-bg-hex {
            fill: rgba(219,234,254,0.7);
          }
          .dark .logo-bg-hex {
            fill: rgba(10,20,40,0.85);
          }
        `}} />
      </svg>
    </div>
  );
}
