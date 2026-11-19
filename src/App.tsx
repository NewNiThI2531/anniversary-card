import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { anniversaryConfig } from './data/anniversaryConfig';
import { PasscodeGate } from './components/PasscodeGate';
import { RelationshipCounter } from './components/RelationshipCounter';
import { RelationshipTimeline } from './components/RelationshipTimeline';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { TypewriterHeading } from './components/TypewriterHeading';
import { runViewTransition } from './utils/viewTransitions';
import {
  calculateAnniversaryState,
  getBangkokYear,
  getSeasonalHeroHeading,
  isSameBangkokMonth,
  toRomanNumeral,
} from './utils/elapsedTime';

function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isPreviewMode20(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('preview') === '20';
}

function getPreviewTimeOffsetMs(): number {
  if (!isPreviewMode20()) return 0;
  return new Date('2026-11-20T09:00:00+07:00').getTime() - Date.now();
}

export function App() {
  const previewNov20 = useMemo(() => isPreviewMode20(), []);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(previewNov20);
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    getInitialReducedMotion
  );
  const previewOffsetMs = useMemo(() => getPreviewTimeOffsetMs(), []);
  const [now, setNow] = useState<Date>(
    () => new Date(Date.now() + previewOffsetMs)
  );

  const startDate = useMemo(
    () => new Date(anniversaryConfig.startDateIso),
    []
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date(Date.now() + previewOffsetMs));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [previewOffsetMs]);

  const anniversaryState = useMemo(
    () => calculateAnniversaryState(startDate, now),
    [startDate, now]
  );

  const celebrationHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion
      ? 'true'
      : 'false';
  }, [reduceMotion]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleUnlock = useCallback(() => {
    runViewTransition(
      () => {
        setIsUnlocked(true);
      },
      () => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        celebrationHeadingRef.current?.focus();
      },
      reduceMotion
    );
  }, [reduceMotion]);

  const handleLock = useCallback(() => {
    runViewTransition(
      () => {
        setIsUnlocked(false);
      },
      () => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        const firstInput = document.querySelector<HTMLInputElement>(
          '.passcode-input'
        );
        firstInput?.focus();
      },
      reduceMotion
    );
  }, [reduceMotion]);

  if (!isUnlocked) {
    return (
      <>
        <AmbientBackdrop
          mode="gate"
          isGrandAnniversary={anniversaryState.isAnniversaryToday}
          reduceMotion={reduceMotion}
        />
        <PasscodeGate config={anniversaryConfig} onUnlock={handleUnlock} />
      </>
    );
  }

  const activeRoman = toRomanNumeral(anniversaryState.activeAnniversaryYear);
  const heroHeading = getSeasonalHeroHeading(
    startDate,
    now,
    anniversaryState,
    anniversaryConfig.celebration.heading
  );

  const isAnniversaryMonth = isSameBangkokMonth(now, startDate);

  return (
    <>
      <AmbientBackdrop
        mode="celebration"
        isGrandAnniversary={anniversaryState.isAnniversaryToday}
        reduceMotion={reduceMotion}
      />
      <div className="celebration-shell">
      <header className="editorial-topbar">
        <div className="editorial-topbar-inner">
          <div className="topbar-identity">
            <img
              src="/logo-gift-card.png"
              alt=""
              width={42}
              height={42}
              className="topbar-logo"
              aria-hidden="true"
            />
            <div className="topbar-meta">
              <span className="topbar-names">
                {anniversaryConfig.brandName} · {anniversaryConfig.coupleNames}
              </span>
              <span className="topbar-edition">
                {anniversaryConfig.establishedLabel} · Year {activeRoman}
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="lock-return-btn"
              onClick={handleLock}
            >
              <LogOut size={15} strokeWidth={1.85} aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="celebration-main">
        <section
          className={`hero-editorial ${isAnniversaryMonth ? 'is-anniversary-hero' : ''}`}
        >
          <TypewriterHeading
            text={heroHeading}
            reduceMotion={reduceMotion}
            isAnniversaryHeadline={isAnniversaryMonth}
            headingRef={celebrationHeadingRef}
          />
        </section>

        <RelationshipCounter
          startDateDisplay={anniversaryConfig.startDateDisplay}
          coupleNames={anniversaryConfig.coupleNames}
          title={anniversaryConfig.celebration.counterTitle}
          state={anniversaryState}
        />

        <RelationshipTimeline
          title={anniversaryConfig.celebration.timelineTitle}
          startYear={getBangkokYear(startDate)}
          completedYears={anniversaryState.elapsed.years}
          targetYearNumber={anniversaryState.countdown.targetYearNumber}
          reduceMotion={reduceMotion}
        />
      </main>
      </div>
    </>
  );
}

export default App;
