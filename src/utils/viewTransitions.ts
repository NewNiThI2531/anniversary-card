import { flushSync } from 'react-dom';

type DocumentWithTransition = Document & {
  startViewTransition?: (callback: () => void) => {
    finished: Promise<void>;
  };
};

/**
 * Runs a state transition inside `document.startViewTransition` when supported
 * and motion is enabled, falling back cleanly and routing focus after DOM update.
 */
export function runViewTransition(
  updateDom: () => void,
  onAfterTransition: () => void,
  reduceMotion: boolean
): void {
  const doc = document as DocumentWithTransition;

  if (reduceMotion || typeof doc.startViewTransition !== 'function') {
    flushSync(updateDom);
    requestAnimationFrame(onAfterTransition);
    return;
  }

  const transition = doc.startViewTransition(() => {
    flushSync(updateDom);
  });

  transition.finished.finally(() => {
    onAfterTransition();
  });
}

