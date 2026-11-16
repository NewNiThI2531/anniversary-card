import { useCallback, useEffect, useId, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PhotoMemory } from '../data/anniversaryConfig';

interface PhotoLightboxProps {
  photos: readonly PhotoMemory[];
  activePhotoId: string | null;
  onClose: () => void;
  onNavigate: (photoId: string) => void;
  reduceMotion: boolean;
}

let cachedSupportsDisplayTransition: boolean | undefined;

function canTransitionDisplay(): boolean {
  if (cachedSupportsDisplayTransition !== undefined) {
    return cachedSupportsDisplayTransition;
  }
  if (
    typeof window === 'undefined' ||
    !window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText =
    'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  cachedSupportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return cachedSupportsDisplayTransition;
}

function supportsTopLayerExit(): boolean {
  return Boolean(
    window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay()
  );
}

export function PhotoLightbox({
  photos,
  activePhotoId,
  onClose,
  onNavigate,
  reduceMotion,
}: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  const currentIndex = photos.findIndex((p) => p.id === activePhotoId);
  const activePhoto = currentIndex >= 0 ? photos[currentIndex] : null;

  const closeWithAnimation = useCallback(async () => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;

    if (!reduceMotion && !supportsTopLayerExit()) {
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((resolve) => window.setTimeout(resolve, 450)),
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }

    dialog.close();
  }, [reduceMotion]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activePhoto && !dialog.open) {
      dialog.removeAttribute('data-closing');
      dialog.showModal();
    } else if (!activePhoto && dialog.open) {
      dialog.removeAttribute('data-closing');
      dialog.close();
    }
  }, [activePhoto]);

  // Sync React state when native dialog closes (Esc, closedby="any", formmethod)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      dialog.removeAttribute('data-closing');
      onClose();
    };

    const handleCancel = (event: Event) => {
      if (!reduceMotion && !supportsTopLayerExit()) {
        event.preventDefault();
        void closeWithAnimation();
      }
    };

    dialog.addEventListener('close', handleNativeClose);
    dialog.addEventListener('cancel', handleCancel);

    // Mandatory fallback for browsers without <dialog closedby="any"> (e.g. Safari)
    let removeClickFallback: (() => void) | undefined;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInsideDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (isInsideDialog) return;
        void closeWithAnimation();
      };
      dialog.addEventListener('click', handleBackdropClick);
      removeClickFallback = () => {
        dialog.removeEventListener('click', handleBackdropClick);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleNativeClose);
      dialog.removeEventListener('cancel', handleCancel);
      removeClickFallback?.();
    };
  }, [closeWithAnimation, onClose, reduceMotion]);

  const goPrev = useCallback(() => {
    if (currentIndex < 0) return;
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;
    onNavigate(photos[prevIdx].id);
  }, [currentIndex, onNavigate, photos]);

  const goNext = useCallback(() => {
    if (currentIndex < 0) return;
    const nextIdx = (currentIndex + 1) % photos.length;
    onNavigate(photos[nextIdx].id);
  }, [currentIndex, onNavigate, photos]);

  useEffect(() => {
    if (!activePhoto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, goNext, goPrev]);

  return (
    <dialog
      ref={dialogRef}
      className="lightbox-dialog"
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      {activePhoto && (
        <div className="lightbox-card">
          <div className="lightbox-top-bar">
            <span className="lightbox-index">
              {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(photos.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => void closeWithAnimation()}
              aria-label="Close photo viewer"
            >
              <X size={20} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>

          <div className="lightbox-media-frame">
            <img
              src={activePhoto.src}
              alt={activePhoto.alt}
              width={600}
              height={520}
              className="lightbox-img"
            />
          </div>

          <div className="lightbox-footer">
            <div className="lightbox-meta">
              <span className="lightbox-date-loc">
                {activePhoto.dateLabel} · {activePhoto.location}
              </span>
              <h3 id={titleId} className="lightbox-caption">
                {activePhoto.caption}
              </h3>
            </div>

            <div className="lightbox-nav">
              <button
                type="button"
                className="lightbox-nav-btn"
                onClick={goPrev}
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} strokeWidth={1.85} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="lightbox-nav-btn"
                onClick={goNext}
                aria-label="Next photo"
              >
                <ChevronRight size={20} strokeWidth={1.85} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

