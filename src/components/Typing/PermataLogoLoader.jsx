import React from 'react';

/**
 * PermataLogoLoader
 * Programmatic animated SVG loader shaped like the Permata AI logo:
 * - Stylized 'P' letter with hollow loop and stepping stem
 * - Cyber circuit tracks & pulsing nodes on the left
 * - Flowing neon current runner and glowing pulse effects
 */
export default function PermataLogoLoader({ className = 'w-8 h-8', size }) {
  const customStyle = size ? { width: size, height: size } : {};

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={customStyle}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Main Maroon to Amber Gradient */}
          <linearGradient id="permataPTrack" x1="25" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#40000b" className="dark:stop-color-[#800020]" />
            <stop offset="40%" stopColor="#800020" className="dark:stop-color-[#b3002d]" />
            <stop offset="75%" stopColor="#c58a27" className="dark:stop-color-[#e5a02e]" />
            <stop offset="100%" stopColor="#f59e0b" className="dark:stop-color-[#fbbf24]" />
          </linearGradient>

          {/* Luminous Golden Beam Gradient */}
          <linearGradient id="permataGoldBeam" x1="10" y1="30" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c58a27" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="permataGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style>{`
          @keyframes circuitPulse {
            0% { stroke-dashoffset: 24; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pTraceFlow {
            0% { stroke-dashoffset: 260; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes nodePulse {
            0%, 100% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.22); opacity: 1; filter: drop-shadow(0 0 4px #f59e0b); }
          }
          .p-circuit-track {
            stroke-dasharray: 4 6;
            animation: circuitPulse 1.2s linear infinite;
          }
          .p-runner-beam {
            stroke-dasharray: 45 160;
            animation: pTraceFlow 2.2s linear infinite;
          }
          .p-node-1 { animation: nodePulse 1.8s ease-in-out infinite 0s; transform-origin: 17.5px 35px; }
          .p-node-2 { animation: nodePulse 1.8s ease-in-out infinite 0.3s; transform-origin: 20.5px 48.5px; }
          .p-node-3 { animation: nodePulse 1.8s ease-in-out infinite 0.6s; transform-origin: 25px 61.5px; }
          .p-node-4 { animation: nodePulse 1.8s ease-in-out infinite 0.9s; transform-origin: 25px 92px; }
        `}</style>

        {/* Ambient subtle glow background */}
        <g className="animate-pulse opacity-40 blur-xs">
          <circle cx="25" cy="60" r="14" fill="#f59e0b" opacity="0.3" />
          <circle cx="65" cy="35" r="20" fill="#c58a27" opacity="0.25" />
        </g>

        {/* ==============================================================
            1. CIRCUIT TRACES & BUS ON THE LEFT (GOLDEN)
           ============================================================== */}
        {/* Base circuit lines (static background track) */}
        <g stroke="#c58a27" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" className="dark:stroke-amber-400">
          <path d="M 17.5 35 H 27.5 L 37.5 24" />
          <path d="M 20.5 48.5 H 25 V 92" />
          <path d="M 33 89 A 5 5 0 0 0 37 92" />
        </g>

        {/* Animated circuit current pulses */}
        <g stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="p-circuit-track dark:stroke-amber-300">
          <path d="M 17.5 35 H 27.5 L 37.5 24" />
          <path d="M 20.5 48.5 H 25 V 92" />
          <path d="M 33 89 A 5 5 0 0 0 37 92" />
        </g>

        {/* Circuit Nodes (Circles) */}
        <g className="p-node-1">
          <circle cx="17.5" cy="35" r="4.2" fill="white" className="dark:fill-[#19151d]" stroke="#c58a27" strokeWidth="2.2" />
          <circle cx="17.5" cy="35" r="2" fill="#f59e0b" />
        </g>

        <g className="p-node-2">
          <circle cx="20.5" cy="48.5" r="3.4" fill="white" className="dark:fill-[#19151d]" stroke="#c58a27" strokeWidth="2" />
          <circle cx="20.5" cy="48.5" r="1.5" fill="#f59e0b" />
        </g>

        <g className="p-node-3">
          <circle cx="25" cy="61.5" r="3.8" fill="white" className="dark:fill-[#19151d]" stroke="#c58a27" strokeWidth="2" />
          <circle cx="25" cy="61.5" r="1.8" fill="#f59e0b" />
        </g>

        <g className="p-node-4">
          <circle cx="25" cy="92" r="3.8" fill="white" className="dark:fill-[#19151d]" stroke="#c58a27" strokeWidth="2" />
          <circle cx="25" cy="92" r="1.8" fill="#f59e0b" />
        </g>

        {/* ==============================================================
            2. THE 'P' SHAPE (HOLLOW GEOMETRIC LETTER WITH LOOP & STEM)
           ============================================================== */}
        {/* Base 'P' Track Outline */}
        <g stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="miter" className="text-[#3b010b] dark:text-[#800020] opacity-35">
          {/* Top outer bar and loop */}
          <path d="M 25.5 11.5 H 68 C 81 11.5 88 19 88 34.5 C 88 49 81 57.5 68 57.5 H 52 V 81 H 39 V 96.5 H 25.5" />
          {/* Inner bar & loop hole */}
          <path d="M 25.5 23 H 40 M 39 45.5 H 66 C 73.5 45.5 75.5 41 75.5 34.5 C 75.5 28 73.5 23.5 66 23.5 H 39 V 58" />
        </g>

        {/* Gradient 'P' Body */}
        <g stroke="url(#permataPTrack)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="miter" className="dark:drop-shadow-[0_0_8px_rgba(212,155,44,0.45)]">
          {/* Main outer perimeter of the 'P' */}
          <path d="M 25.5 11.5 H 68 C 81 11.5 88 19 88 34.5 C 88 49 81 57.5 68 57.5 H 52 V 81 H 39 V 96.5" />
          {/* Inner horizontal slot & loop return */}
          <path d="M 25.5 23 H 39 V 45.5 H 66 C 73.5 45.5 75.5 41 75.5 34.5 C 75.5 28 73.5 23.5 66 23.5 H 39 V 96.5" />
        </g>

        {/* Luminous Cyber Tracer Beam (The moving light racing through the P) */}
        <g stroke="url(#permataGoldBeam)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" className="p-runner-beam" filter="url(#permataGlow)">
          <path d="M 25.5 11.5 H 68 C 81 11.5 88 19 88 34.5 C 88 49 81 57.5 68 57.5 H 52 V 81 H 39 V 96.5" />
          <path d="M 39 96.5 V 45.5 H 66 C 73.5 45.5 75.5 41 75.5 34.5 C 75.5 28 73.5 23.5 66 23.5 H 25.5" />
        </g>
      </svg>
    </div>
  );
}

