import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { anniversaryConfig } from './data/anniversaryConfig';
import { PasscodeGate } from './components/PasscodeGate';
import { RelationshipCounter } from './components/RelationshipCounter';
import { PolaroidBoard } from './components/PolaroidBoard';
import { PhotoLightbox } from './components/PhotoLightbox';
import { LoveLetter } from './components/LoveLetter';
import { RelationshipTimeline } from './components/RelationshipTimeline';
import { runViewTransition } from './utils/viewTransitions';
import {
  calculateAnniversaryState,
  formatOrdinal,
  getSeasonalHeroHeading,
  toRomanNumeral,
} from './utils/elapsedTime';

function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    getInitialReducedMotion
  );
  const [now, setNow] = useState<Date>(() => new Date());

  const startDate = useMemo(
    () => new Date(anniversaryConfig.startDateIso),
    []
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const anniversaryState = useMemo(
    () => calculateAnniversaryState(startDate, now),
    [startDate, now]
  );

  const celebrationHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const lastPolaroidTriggerRef = useRef<HTMLButtonElement | null>(null);

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
    setActivePhotoId(null);
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

  const handleSelectPhoto = useCallback(
    (photoId: string, triggerElement: HTMLButtonElement) => {
      lastPolaroidTriggerRef.current = triggerElement;
      setActivePhotoId(photoId);
    },
    []
  );

  const handleCloseLightbox = useCallback(() => {
    setActivePhotoId(null);
    requestAnimationFrame(() => {
      lastPolaroidTriggerRef.current?.focus();
    });
  }, []);

  if (!isUnlocked) {
    return (
      <PasscodeGate
        config={anniversaryConfig}
        onUnlock={handleUnlock}
        reduceMotion={reduceMotion}
        onToggleMotion={() => setReduceMotion((prev) => !prev)}
      />
    );
  }

  const activeRoman = toRomanNumeral(anniversaryState.activeAnniversaryYear);
  const activeOrdinal = formatOrdinal(anniversaryState.activeAnniversaryYear);
  const dynamicEyebrow =
    anniversaryState.elapsed.years >= 6
      ? `${anniversaryConfig.brandName} · ${activeOrdinal} Year Together`
      : `${anniversaryConfig.brandName} · Approaching ${activeOrdinal} Anniversary`;
  const heroHeading = getSeasonalHeroHeading(
    startDate,
    now,
    anniversaryState,
    anniversaryConfig.celebration.heading
  );

  return (
    <div className="celebration-shell">
      <header className="editorial-topbar">
        <div className="editorial-topbar-inner">
          <div className="topbar-identity">
            <span className="topbar-monogram" aria-hidden="true">
              AB
            </span>
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
              className="motion-toggle"
              onClick={() => setReduceMotion((prev) => !prev)}
              aria-pressed={!reduceMotion}
            >
              {reduceMotion ? 'Motion: Still paper' : 'Motion: Gentle'}
            </button>
            <button
              type="button"
              className="lock-return-btn"
              onClick={handleLock}
            >
              <Lock size={15} strokeWidth={1.85} aria-hidden="true" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      <main className="celebration-main">
        <section className="hero-editorial">
          <p className="eyebrow">{dynamicEyebrow}</p>
          <h1
            ref={celebrationHeadingRef}
            tabIndex={-1}
            className="hero-heading"
          >
            {heroHeading}
          </h1>
          <p className="hero-subheading">
            {anniversaryConfig.celebration.subheading}
          </p>
        </section>

        <RelationshipCounter
          startDateDisplay={anniversaryConfig.startDateDisplay}
          coupleNames={anniversaryConfig.coupleNames}
          title={anniversaryConfig.celebration.counterTitle}
          state={anniversaryState}
        />

        <PolaroidBoard
          title={anniversaryConfig.celebration.boardTitle}
          subtitle={anniversaryConfig.celebration.boardSubtitle}
          photos={anniversaryConfig.photos}
          onSelectPhoto={handleSelectPhoto}
        />

        <LoveLetter
          sectionTitle={anniversaryConfig.celebration.letterSectionTitle}
          stampLabel={activeRoman}
          letter={anniversaryConfig.letter}
        />

        <RelationshipTimeline
          title={anniversaryConfig.celebration.timelineTitle}
          milestones={anniversaryConfig.timeline}
        />
      </main>

      <footer className="editorial-footer">
        <div className="footer-divider" aria-hidden="true" />
        <p>{anniversaryConfig.celebration.footerNote}</p>
      </footer>

      <PhotoLightbox
        photos={anniversaryConfig.photos}
        activePhotoId={activePhotoId}
        onClose={handleCloseLightbox}
        onNavigate={setActivePhotoId}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}

export default App;
