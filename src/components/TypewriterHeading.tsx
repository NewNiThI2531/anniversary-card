import { useEffect, useState, type Ref } from 'react';
import { Sparkles } from 'lucide-react';

interface TypewriterHeadingProps {
  text: string;
  reduceMotion: boolean;
  isAnniversaryHeadline?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  /** Pause in ms after finishing before replaying the typing effect */
  replayDelayMs?: number;
}

export function TypewriterHeading({
  text,
  reduceMotion,
  isAnniversaryHeadline = false,
  headingRef,
  replayDelayMs = 10_000,
}: TypewriterHeadingProps) {
  const [visibleCount, setVisibleCount] = useState<number>(() =>
    reduceMotion ? text.length : 0
  );

  useEffect(() => {
    if (reduceMotion) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);
    let current = 0;
    let timeoutId = 0;

    const scheduleStep = (delay: number) => {
      timeoutId = window.setTimeout(() => {
        if (current >= text.length) {
          current = 0;
          setVisibleCount(0);
          scheduleStep(250);
          return;
        }

        current += 1;
        setVisibleCount(current);

        if (current < text.length) {
          const ch = text[current - 1];
          const pause = ch === ' ' ? 65 : 44;
          scheduleStep(pause);
        } else {
          scheduleStep(replayDelayMs);
        }
      }, delay);
    };

    scheduleStep(200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [text, reduceMotion, replayDelayMs]);

  const headingClasses = `hero-heading ${
    isAnniversaryHeadline ? 'is-anniversary' : ''
  }`;

  if (reduceMotion) {
    return (
      <div className={isAnniversaryHeadline ? 'hero-celebration-wrap' : ''}>
        {isAnniversaryHeadline && (
          <div className="hero-ornament" aria-hidden="true">
            <span className="hero-ornament-line" />
            <Sparkles size={14} strokeWidth={1.75} />
            <span className="hero-ornament-line" />
          </div>
        )}
        <h1 ref={headingRef} tabIndex={-1} className={headingClasses}>
          <span className="hero-heading-ink">{text}</span>
        </h1>
      </div>
    );
  }

  const typedText = text.slice(0, visibleCount);
  const isDone = visibleCount >= text.length;

  return (
    <div className={isAnniversaryHeadline ? 'hero-celebration-wrap' : ''}>
      {isAnniversaryHeadline && (
        <div className="hero-ornament" aria-hidden="true">
          <span className="hero-ornament-line" />
          <Sparkles size={14} strokeWidth={1.75} />
          <span className="hero-ornament-line" />
        </div>
      )}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={`${headingClasses} hero-heading-typing`}
      >
        <span className="visually-hidden">{text}</span>
        <span className="typing-ghost" aria-hidden="true">
          {text}
        </span>
        <span className="typing-live" aria-hidden="true">
          <span className="hero-heading-ink">{typedText}</span>
          {!isDone && <span className="typing-caret is-typing" />}
        </span>
      </h1>
    </div>
  );
}
