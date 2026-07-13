import { useEffect, useRef, useState } from 'react';
import {
  HiOutlineArrowDownTray,
  HiOutlineCheck,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineSignal,
  HiOutlineSparkles,
} from 'react-icons/hi2';

type Phase = {
  label: string;
  icon: typeof HiOutlineSignal;
  start: number;
  end: number;
};

const PHASES: Phase[] = [
  { label: 'Connecting to server', icon: HiOutlineSignal, start: 0, end: 25 },
  { label: 'Authenticating', icon: HiOutlineShieldCheck, start: 25, end: 50 },
  { label: 'Fetching workspace data', icon: HiOutlineArrowDownTray, start: 50, end: 75 },
  { label: 'Preparing your workspace', icon: HiOutlineSparkles, start: 75, end: 100 },
];

function getCurrentStep(progress: number) {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (progress >= PHASES[i].start) return i;
  }
  return 0;
}

type Props = {
  onComplete: () => void;
};

export function PremiumLoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const doneRef = useRef(false);

  useEffect(() => {
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const duration = 3200;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !doneRef.current) {
      doneRef.current = true;
      setExiting(true);
      const id = setTimeout(onComplete, 450);
      return () => clearTimeout(id);
    }
  }, [progress, onComplete]);

  const currentStep = getCurrentStep(progress);

  return (
    <div className={`premium-loading-overlay ${exiting ? 'premium-loading-exit' : ''}`}>
      <div className="premium-skeleton-shell">
        <div className="premium-skeleton-sidebar">
          <div className="premium-skeleton-brand">
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div style={{ display: 'grid', gap: 6, flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '70%' }} />
              <div className="skeleton" style={{ height: 10, width: '50%' }} />
            </div>
          </div>
          <div className="premium-skeleton-nav">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="premium-skeleton-nav-item">
                <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 12, width: `${55 + (i % 3) * 10}%` }} />
              </div>
            ))}
          </div>
          <div className="premium-skeleton-footer">
            <div className="skeleton" style={{ height: 10, width: '60%' }} />
            <div className="skeleton" style={{ height: 10, width: '40%' }} />
          </div>
        </div>

        <div className="premium-skeleton-content">
          <div className="premium-skeleton-page-header">
            <div className="skeleton" style={{ height: 28, width: 220 }} />
            <div className="skeleton" style={{ height: 14, width: 360, marginTop: 8 }} />
          </div>
          <div className="skeleton" style={{ height: 1, width: '100%', margin: '22px 0' }} />
          <div className="premium-skeleton-metrics">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="premium-skeleton-metric">
                <div className="skeleton" style={{ height: 11, width: '65%' }} />
                <div className="skeleton" style={{ height: 26, width: '40%' }} />
                <div className="skeleton" style={{ height: 10, width: '80%' }} />
              </div>
            ))}
          </div>
          <div className="premium-skeleton-panels">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="premium-skeleton-panel">
                <div className="premium-skeleton-panel-header">
                  <div className="skeleton" style={{ height: 14, width: 140 }} />
                </div>
                <div className="premium-skeleton-panel-body">
                  <div className="skeleton" style={{ height: 12, width: '90%' }} />
                  <div className="skeleton" style={{ height: 12, width: '75%' }} />
                  <div className="skeleton" style={{ height: 12, width: '82%' }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="premium-loading-panel">
        <div className="premium-loading-brand">
          <div className="premium-loading-brand-icon">
            <HiOutlineChatBubbleLeftRight size={26} aria-hidden />
          </div>
          <strong>Speak To Reach</strong>
        </div>

        <div className="premium-loading-percentage" aria-live="polite" aria-label={`${progress}% loaded`}>
          {progress}
          <span className="premium-loading-percent-sign">%</span>
        </div>

        <div className="premium-loading-bar-track">
          <div
            className="premium-loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="premium-loading-steps" role="list" aria-label="Loading progress">
          {PHASES.map((phase, i) => {
            const isCompleted = progress > phase.end || (progress === 100 && i <= currentStep);
            const isActive = i === currentStep && !isCompleted;
            const Icon = phase.icon;

            return (
              <div
                key={phase.label}
                className={`premium-loading-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                role="listitem"
              >
                <div className="premium-loading-step-icon">
                  {isCompleted ? (
                    <HiOutlineCheck size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <span>{phase.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
