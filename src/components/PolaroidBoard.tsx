import type { CSSProperties } from 'react';
import { Camera } from 'lucide-react';
import type { PhotoMemory } from '../data/anniversaryConfig';

interface PolaroidBoardProps {
  title: string;
  subtitle: string;
  photos: readonly PhotoMemory[];
  onSelectPhoto: (photoId: string, triggerElement: HTMLButtonElement) => void;
}

export function PolaroidBoard({
  title,
  subtitle,
  photos,
  onSelectPhoto,
}: PolaroidBoardProps) {
  return (
    <section className="board-section" aria-labelledby="board-heading">
      <div className="section-intro">
        <span className="section-kicker">
          <Camera size={14} strokeWidth={1.85} aria-hidden="true" />
          <span>Archive Board</span>
        </span>
        <h2 id="board-heading" className="section-heading">
          {title}
        </h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>

      <div className="polaroid-grid">
        {photos.map((photo, index) => {
          const style = {
            '--tilt': `${photo.tiltDeg}deg`,
            '--tape-color': photo.tapeColor,
            '--tape-angle': `${photo.tapeAngleDeg}deg`,
          } as CSSProperties;

          return (
            <figure key={photo.id} className="polaroid-frame" style={style}>
              <span className="washi-tape" aria-hidden="true" />
              <button
                type="button"
                className="polaroid-trigger"
                onClick={(e) => onSelectPhoto(photo.id, e.currentTarget)}
                aria-label={`View memory: ${photo.caption} (${photo.dateLabel})`}
              >
                <span className="polaroid-photo-wrap">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={600}
                    height={520}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="polaroid-img"
                  />
                </span>
                <span className="polaroid-meta-row">
                  <span className="polaroid-date">{photo.dateLabel}</span>
                  <span className="polaroid-location">{photo.location}</span>
                </span>
                <span className="polaroid-caption">{photo.caption}</span>
              </button>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

