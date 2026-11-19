import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Calendar } from 'lucide-react';
import { formatOrdinal } from '../utils/elapsedTime';

interface RelationshipTimelineProps {
  title: string;
  startYear: number;
  completedYears: number;
  targetYearNumber: number;
  reduceMotion: boolean;
}

export function RelationshipTimeline({
  title,
  startYear,
  completedYears,
  targetYearNumber,
  reduceMotion,
}: RelationshipTimelineProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEntered, setHasEntered] = useState<boolean>(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setHasEntered(true);
      return;
    }

    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver !== 'function') {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const totalSteps = Math.max(6, targetYearNumber);
  const progressRatio = Math.min(1, Math.max(0, completedYears / totalSteps));
  const hasApproachingSegment =
    targetYearNumber > completedYears && targetYearNumber <= totalSteps;

  const nodes = Array.from({ length: totalSteps + 1 }, (_, index) => {
    const year = startYear + index;
    const label = index === 0 ? 'Start' : formatOrdinal(index);
    const isReached = index <= completedYears;
    const isNext = index === targetYearNumber && !isReached;
    return { index, year, label, isReached, isNext };
  });

  const trackStyle = {
    '--node-count': String(nodes.length),
    '--progress-ratio': String(progressRatio),
    '--seg-start': `${(completedYears / totalSteps) * 100}%`,
    '--seg-size': `${(1 / totalSteps) * 100}%`,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="timeline-section"
      aria-labelledby="timeline-heading"
    >
      <div className="section-intro">
        <span className="section-kicker">
          <Calendar size={14} strokeWidth={1.85} aria-hidden="true" />
          <span>Year by Year</span>
        </span>
        <h2 id="timeline-heading" className="section-heading">
          {title}
        </h2>
      </div>

      <div
        className={`timeline-track-card ${hasEntered ? 'is-visible' : ''}`}
      >
        <ol
          className="timeline-track"
          aria-label="Anniversary timeline"
          style={trackStyle}
        >
          <li className="timeline-progress-rail" aria-hidden="true">
            <span className="timeline-progress-fill" />
            {hasApproachingSegment && (
              <span className="timeline-loading-segment">
                <span className="timeline-loading-base" />
                <span className="timeline-loading-beam" />
              </span>
            )}
          </li>

          {nodes.map((node) => {
            const nodeStyle = {
              '--step-index': String(node.index),
            } as CSSProperties;

            return (
              <li
                key={node.year}
                style={nodeStyle}
                className={`timeline-node ${
                  node.isReached
                    ? 'is-reached'
                    : node.isNext
                      ? 'is-next'
                      : ''
                }`}
              >
                <span className="timeline-dot" aria-hidden="true" />
                <span className="timeline-node-label">{node.label}</span>
                <span className="timeline-node-year">{node.year}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
