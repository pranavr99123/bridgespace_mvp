"use client";

import type { PortraitState } from "@/lib/types";

export function Portrait({ state }: { state: PortraitState }) {
  const skyLightness = Math.round(18 + (state.warmth + state.openness) / 3);
  const sunOpacity = (state.warmth + state.momentum) / 220;
  const mountainDarkness = Math.round(18 + state.tension / 2);
  const waterGlow = Math.round(20 + state.openness / 2);
  const cloudOpacity = Math.min(0.7, state.tension / 120);
  const pulseSpeed = Math.max(5, 14 - state.momentum / 10);

  return (
    <div className="card p-4">
      <svg viewBox="0 0 360 220" className="w-full overflow-visible rounded-xl">
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`hsl(220, 70%, ${skyLightness + 24}%)`} />
            <stop offset="100%" stopColor={`hsl(230, 48%, ${skyLightness}%)`} />
          </linearGradient>
          <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`hsl(200, 70%, ${waterGlow + 10}%)`} />
            <stop offset="100%" stopColor={`hsl(216, 60%, ${waterGlow}%)`} />
          </linearGradient>
        </defs>
        <rect width="360" height="220" fill="url(#sky)" />
        <circle cx="285" cy="52" r="30" fill="#ffd487" opacity={sunOpacity}>
          <animate attributeName="opacity" values={`${sunOpacity * 0.8};${sunOpacity};${sunOpacity * 0.8}`} dur={`${pulseSpeed}s`} repeatCount="indefinite" />
        </circle>
        <ellipse cx="120" cy="58" rx="55" ry="18" fill="#d6dbec" opacity={cloudOpacity} />
        <ellipse cx="210" cy="72" rx="42" ry="14" fill="#d6dbec" opacity={cloudOpacity * 0.8} />
        <path d="M0,148 L60,110 L125,150 L185,100 L250,150 L318,108 L360,148 L360,220 L0,220 Z" fill={`hsl(218, 28%, ${50 - mountainDarkness / 2}%)`} />
        <path d="M0,170 C42,162 88,176 132,170 C170,165 216,177 260,170 C304,162 340,173 360,170 L360,220 L0,220 Z" fill="url(#water)" opacity="0.92">
          <animate attributeName="d" dur={`${pulseSpeed}s`} repeatCount="indefinite" values="M0,170 C42,162 88,176 132,170 C170,165 216,177 260,170 C304,162 340,173 360,170 L360,220 L0,220 Z;M0,170 C40,176 90,162 132,170 C172,176 214,162 260,170 C308,176 338,164 360,170 L360,220 L0,220 Z;M0,170 C42,162 88,176 132,170 C170,165 216,177 260,170 C304,162 340,173 360,170 L360,220 L0,220 Z" />
        </path>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs subtle">
        <p>Warmth {state.warmth}</p>
        <p>Tension {state.tension}</p>
        <p>Openness {state.openness}</p>
        <p>Momentum {state.momentum}</p>
      </div>
    </div>
  );
}
