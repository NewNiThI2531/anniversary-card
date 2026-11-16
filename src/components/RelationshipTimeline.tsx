import { Calendar } from 'lucide-react';
import type { TimelineMilestone } from '../data/anniversaryConfig';

interface RelationshipTimelineProps {
  title: string;
  milestones: readonly TimelineMilestone[];
}

export function RelationshipTimeline({
  title,
  milestones,
}: RelationshipTimelineProps) {
  return (
    <section className="timeline-section" aria-labelledby="timeline-heading">
      <div className="section-intro">
        <span className="section-kicker">
          <Calendar size={14} strokeWidth={1.85} aria-hidden="true" />
          <span>Year by Year</span>
        </span>
        <h2 id="timeline-heading" className="section-heading">
          {title}
        </h2>
      </div>

      <ol className="timeline-list">
        {milestones.map((item) => (
          <li key={item.yearLabel} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true" />
            <div className="timeline-meta">
              <span className="timeline-year">{item.yearLabel}</span>
              <span className="timeline-date">{item.dateLabel}</span>
            </div>
            <div className="timeline-card">
              <h3 className="timeline-title">{item.title}</h3>
              <p className="timeline-desc">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

