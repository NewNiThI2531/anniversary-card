import { Feather } from 'lucide-react';
import type { AnniversaryConfig } from '../data/anniversaryConfig';

interface LoveLetterProps {
  sectionTitle: string;
  stampLabel: string;
  letter: AnniversaryConfig['letter'];
}

export function LoveLetter({
  sectionTitle,
  stampLabel,
  letter,
}: LoveLetterProps) {
  return (
    <section className="letter-section" aria-labelledby="letter-heading">
      <div className="section-intro">
        <span className="section-kicker">
          <Feather size={14} strokeWidth={1.85} aria-hidden="true" />
          <span>Stationery</span>
        </span>
        <h2 id="letter-heading" className="section-heading">
          {sectionTitle}
        </h2>
      </div>

      <article className="stationery-sheet">
        <div className="stationery-stamp" aria-hidden="true">
          <span>{stampLabel}</span>
        </div>

        <header className="stationery-header">
          <time className="stationery-date">{letter.dateLabel}</time>
          <p className="stationery-salutation">{letter.salutation}</p>
        </header>

        <div className="stationery-body">
          {letter.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <footer className="stationery-footer">
          <p className="stationery-closing">{letter.closing}</p>
          <p className="stationery-signature">{letter.signature}</p>
        </footer>
      </article>
    </section>
  );
}

