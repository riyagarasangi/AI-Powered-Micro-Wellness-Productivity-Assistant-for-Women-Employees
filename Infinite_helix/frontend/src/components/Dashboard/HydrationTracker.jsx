import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';

const QUICK_AMOUNTS = [
  { label: 'Glass', ml: 250 },
  { label: 'Cup', ml: 200 },
  { label: 'Bottle', ml: 500 },
  { label: 'Sip', ml: 100 },
];

function WaterWave({ progress }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  return (
    <div className="relative w-full h-3 bg-helix-bg rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-helix-sky to-cyan-400 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}

export default function HydrationTracker() {
  const { todayMetrics, addHydration } = useWellness();
  const { hydration } = todayMetrics;
  const [amountMl, setAmountMl] = useState(hydration.default_amount_ml || 250);

  const progress = hydration.goal_ml > 0
    ? Math.round((hydration.ml_today / hydration.goal_ml) * 100)
    : 0;
  const goalReached = hydration.ml_today >= hydration.goal_ml;

  const handleLog = () => {
    if (amountMl > 0 && !goalReached) {
      addHydration(amountMl);
    }
  };

  const handleAmountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      setAmountMl(val);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-helix-muted">Hydration</h3>
        <span className="text-xs text-helix-sky font-medium">
          {hydration.ml_today} / {hydration.goal_ml} ml
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative flex flex-col items-center">
          <svg width="80" height="96" viewBox="0 0 80 96" fill="none">
            <defs>
              <clipPath id="dropClip">
                <path d="M40 4C40 4 8 40 8 60C8 77.67 22.33 92 40 92C57.67 92 72 77.67 72 60C72 40 40 4 40 4Z" />
              </clipPath>
            </defs>
            <path
              d="M40 4C40 4 8 40 8 60C8 77.67 22.33 92 40 92C57.67 92 72 77.67 72 60C72 40 40 4 40 4Z"
              fill="#2e2e3c"
              stroke="#3d3d52"
              strokeWidth="1.5"
            />
            <rect
              x="0" y={92 - (88 * Math.min(progress, 100)) / 100}
              width="80"
              height={(88 * Math.min(progress, 100)) / 100}
              fill="url(#waterGrad)"
              clipPath="url(#dropClip)"
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="mt-1 text-lg font-display font-bold text-helix-sky">{progress}%</span>
        </div>
      </div>

      <WaterWave progress={progress} />

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={amountMl}
              onChange={handleAmountChange}
              min="50"
              max="2000"
              step="50"
              className="w-full bg-helix-bg/50 border border-helix-border rounded-xl px-3 py-2 pr-10 text-sm text-helix-text
                         focus:outline-none focus:border-helix-sky/50 focus:ring-1 focus:ring-helix-sky/20 transition-all
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-helix-muted">ml</span>
          </div>
          <button
            onClick={handleLog}
            disabled={goalReached || amountMl <= 0}
            className="px-4 py-2 rounded-xl bg-helix-sky/10 text-helix-sky text-sm font-medium
                       hover:bg-helix-sky/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                       whitespace-nowrap"
          >
            {goalReached ? '✓ Done!' : '+ Log'}
          </button>
        </div>

        <div className="flex gap-1.5">
          {QUICK_AMOUNTS.map(({ label, ml }) => (
            <button
              key={label}
              onClick={() => setAmountMl(ml)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${amountMl === ml
                  ? 'bg-helix-sky/20 text-helix-sky border border-helix-sky/30'
                  : 'bg-helix-bg/50 text-helix-muted hover:text-helix-text border border-transparent'
                }`}
            >
              {label}
              <span className="block text-[10px] opacity-70">{ml}ml</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
