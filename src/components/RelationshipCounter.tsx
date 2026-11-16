import { Clock, Sparkles } from 'lucide-react';
import {
  type AnniversaryState,
  formatOrdinal,
} from '../utils/elapsedTime';

interface RelationshipCounterProps {
  startDateDisplay: string;
  coupleNames: string;
  title: string;
  state: AnniversaryState;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RelationshipCounter({
  startDateDisplay,
  coupleNames,
  title,
  state,
}: RelationshipCounterProps) {
  const { elapsed, countdown, isAnniversaryToday, activeAnniversaryYear } =
    state;

  const elapsedUnits = [
    {
      label: elapsed.years === 1 ? 'Year' : 'Years',
      value: elapsed.years,
      pad: 1,
    },
    {
      label: elapsed.months === 1 ? 'Month' : 'Months',
      value: elapsed.months,
      pad: 1,
    },
    {
      label: elapsed.days === 1 ? 'Day' : 'Days',
      value: elapsed.days,
      pad: 1,
    },
    { label: 'Hours', value: elapsed.hours, pad: 2 },
    { label: 'Minutes', value: elapsed.minutes, pad: 2 },
    { label: 'Seconds', value: elapsed.seconds, pad: 2 },
  ];

  const countdownUnits = [
    {
      label: countdown.days === 1 ? 'Day' : 'Days',
      value: countdown.days,
      pad: 1,
    },
    { label: 'Hours', value: countdown.hours, pad: 2 },
    { label: 'Min', value: countdown.minutes, pad: 2 },
    { label: 'Sec', value: countdown.seconds, pad: 2 },
  ];

  const upcomingOrdinal = formatOrdinal(countdown.targetYearNumber);
  const activeOrdinal = formatOrdinal(activeAnniversaryYear);

  return (
    <section className="counter-section" aria-labelledby="counter-heading">
      {isAnniversaryToday && (
        <div className="anniversary-today-banner" role="status">
          <Sparkles size={16} strokeWidth={1.9} aria-hidden="true" />
          <span>
            Happy {activeOrdinal} Anniversary, {coupleNames} —{' '}
            {elapsed.years} {elapsed.years === 1 ? 'year' : 'years'} together
            today.
          </span>
        </div>
      )}

      <div className="counter-header">
        <div className="counter-title-group">
          <span className="section-kicker">
            <Clock size={14} strokeWidth={1.85} aria-hidden="true" />
            <span>Counting Live</span>
          </span>
          <h2 id="counter-heading" className="section-heading">
            {title}
          </h2>
        </div>
        <div className="total-days-stamp">
          <span className="total-days-number">
            {elapsed.totalDays.toLocaleString()}
          </span>
          <span className="total-days-label">days side by side</span>
        </div>
      </div>

      <div
        className="counter-grid"
        role="timer"
        aria-label={`Elapsed time since ${startDateDisplay}`}
      >
        {elapsedUnits.map((unit) => (
          <div key={unit.label} className="counter-cell">
            <span className="counter-value">
              {String(unit.value).padStart(unit.pad, '0')}
            </span>
            <span className="counter-unit">{unit.label}</span>
          </div>
        ))}
      </div>

      <div
        className="countdown-strip"
        aria-label={`Countdown to ${upcomingOrdinal} anniversary on ${formatShortDate(countdown.targetDate)}`}
      >
        <div className="countdown-copy">
          <span className="countdown-kicker">Next Milestone</span>
          <p className="countdown-title">
            Counting down to our <strong>{upcomingOrdinal} Anniversary</strong>{' '}
            <span className="countdown-date">
              · {formatShortDate(countdown.targetDate)}
            </span>
          </p>
        </div>

        <div className="countdown-digits">
          {countdownUnits.map((unit) => (
            <div key={unit.label} className="countdown-pill">
              <span className="countdown-num">
                {String(unit.value).padStart(unit.pad, '0')}
              </span>
              <span className="countdown-unit">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
