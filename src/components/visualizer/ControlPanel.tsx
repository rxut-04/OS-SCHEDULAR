"use client";

interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  canStepForward: boolean;
  canStepBackward: boolean;
  hasResult: boolean;
}

export function ControlPanel({
  isPlaying,
  onPlayPause,
  onReset,
  onStepForward,
  onStepBackward,
  speed,
  onSpeedChange,
  canStepForward,
  canStepBackward,
  hasResult,
}: ControlPanelProps) {
  return (
    <div className="glass-effect rounded-xl p-3 sm:p-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onStepBackward}
            disabled={!canStepBackward || !hasResult}
            className="p-1.5 sm:p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Step"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          <button
            onClick={onPlayPause}
            disabled={!hasResult}
            className={`
              p-2 sm:p-3 rounded-lg font-semibold transition-all flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base
              ${isPlaying 
                ? 'bg-[var(--warning)] text-[var(--bg-primary)]' 
                : 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'}
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={!canStepForward || !hasResult}
            className="p-1.5 sm:p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Step"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          <button
            onClick={onReset}
            disabled={!hasResult}
            className="p-1.5 sm:p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--error)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Reset"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-[var(--text-muted)]">Speed:</span>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[0.5, 1, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`
                  px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono transition-all
                  ${speed === s 
                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' 
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'}
                `}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
