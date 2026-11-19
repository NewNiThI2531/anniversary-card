import { useId, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import type { AnniversaryConfig } from '../data/anniversaryConfig';
import { distributePastedDigits } from '../utils/elapsedTime';

type BoxStatus = 'idle' | 'error' | 'matched';

interface PasscodeGateProps {
  config: AnniversaryConfig;
  onUnlock: () => void;
}

export function PasscodeGate({ config, onUnlock }: PasscodeGateProps) {
  const baseId = useId();
  const [values, setValues] = useState<[string, string, string]>(['', '', '']);
  const [boxStatus, setBoxStatus] = useState<
    [BoxStatus, BoxStatus, BoxStatus]
  >(['idle', 'idle', 'idle']);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shakeTrigger, setShakeTrigger] = useState<number>(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null]);
  const lastCompositionEndAt = useRef<number | null>(null);

  const focusBox = (index: number) => {
    const target = inputRefs.current[index];
    if (!target) return;
    target.focus();
    const len = target.value.length;
    target.setSelectionRange(len, len);
  };

  const handleChange = (index: number, rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 2);

    setValues((prev) => {
      const next: [string, string, string] = [prev[0], prev[1], prev[2]];
      next[index] = digitsOnly;
      return next;
    });

    setBoxStatus((prev) => {
      if (prev[index] === 'idle' && errorMessage === '') return prev;
      const next: [BoxStatus, BoxStatus, BoxStatus] = [
        prev[0],
        prev[1],
        prev[2],
      ];
      next[index] = 'idle';
      return next;
    });
    if (errorMessage) {
      setErrorMessage('');
    }

    if (digitsOnly.length === 2 && index < 2) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pastedText = event.clipboardData.getData('text');
    const result = distributePastedDigits(pastedText, index, values);
    if (!result) return;

    event.preventDefault();
    setValues(result.nextValues);
    setBoxStatus(['idle', 'idle', 'idle']);
    setErrorMessage('');

    requestAnimationFrame(() => {
      focusBox(result.focusIndex);
    });
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      const isSafariPostComposition =
        lastCompositionEndAt.current !== null &&
        Math.abs(event.timeStamp - lastCompositionEndAt.current) < 50;

      if (event.nativeEvent.isComposing || isSafariPostComposition) {
        event.preventDefault();
        return;
      }
      return;
    }

    if (event.key === 'Backspace' && values[index].length === 0 && index > 0) {
      event.preventDefault();
      focusBox(index - 1);
      return;
    }

    const input = event.currentTarget;
    if (
      event.key === 'ArrowLeft' &&
      index > 0 &&
      input.selectionStart === 0 &&
      input.selectionEnd === 0
    ) {
      event.preventDefault();
      focusBox(index - 1);
      return;
    }

    if (
      event.key === 'ArrowRight' &&
      index < 2 &&
      input.selectionStart === input.value.length &&
      input.selectionEnd === input.value.length
    ) {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emptyIndices: number[] = [];
    const partialIndices: number[] = [];
    const mismatchIndices: number[] = [];

    const nextStatus: [BoxStatus, BoxStatus, BoxStatus] = [
      'idle',
      'idle',
      'idle',
    ];

    values.forEach((val, idx) => {
      if (val.length === 0) {
        emptyIndices.push(idx);
        nextStatus[idx] = 'error';
      } else if (val.length < 2) {
        partialIndices.push(idx);
        nextStatus[idx] = 'error';
      } else if (val !== config.passcode[idx]) {
        mismatchIndices.push(idx);
        nextStatus[idx] = 'error';
      } else {
        nextStatus[idx] = 'matched';
      }
    });

    if (
      emptyIndices.length === 0 &&
      partialIndices.length === 0 &&
      mismatchIndices.length === 0
    ) {
      setBoxStatus(['matched', 'matched', 'matched']);
      setErrorMessage('');
      onUnlock();
      return;
    }

    setBoxStatus(nextStatus);
    setShakeTrigger((n) => n + 1);

    const firstBadIndex =
      emptyIndices[0] ?? partialIndices[0] ?? mismatchIndices[0] ?? 0;

    if (emptyIndices.length === 3) {
      setErrorMessage('Enter all three two-digit numbers to open the keepsake.');
    } else if (emptyIndices.length > 0) {
      const boxNames = emptyIndices
        .map((i) => config.lockScreen.boxLabels[i])
        .join(' & ');
      setErrorMessage(
        `${boxNames} ${
          emptyIndices.length === 1 ? 'box is' : 'boxes are'
        } still empty — 2 digits per box.`
      );
    } else if (partialIndices.length > 0) {
      const boxNames = partialIndices
        .map((i) => config.lockScreen.boxLabels[i])
        .join(' & ');
      setErrorMessage(`Each box needs 2 digits (check ${boxNames}).`);
    } else {
      const boxNames = mismatchIndices
        .map((i) => config.lockScreen.boxLabels[i])
        .join(' & ');
      setErrorMessage(
        `Not quite right — check the ${boxNames} ${
          mismatchIndices.length === 1 ? 'box' : 'boxes'
        }.`
      );
    }

    focusBox(firstBadIndex);
  };

  const errorId = `${baseId}-error`;

  return (
    <main className="gate-shell">
      <section
        className="gate-card"
        aria-labelledby={`${baseId}-heading`}
        data-shake={
          shakeTrigger === 0
            ? undefined
            : shakeTrigger % 2 === 1
              ? 'odd'
              : 'even'
        }
      >
        <div className="gate-header">
          <img
            src="/logo-gift-card.png"
            alt=""
            width={72}
            height={72}
            className="gate-logo"
            aria-hidden="true"
          />
          <h1 id={`${baseId}-heading`} className="gate-title">
            {config.lockScreen.title}
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="passcode-form">
          <fieldset
            className="passcode-fieldset"
            aria-describedby={errorMessage ? errorId : undefined}
          >
            <legend className="visually-hidden">
              Three-part numeric passcode
            </legend>

            <div className="passcode-boxes">
              {values.map((val, index) => {
                const inputId = `${baseId}-box-${index}`;
                const status = boxStatus[index];
                const isInvalid = status === 'error';

                return (
                  <div key={inputId} className="passcode-slot">
                    <label htmlFor={inputId} className="passcode-label">
                      {config.lockScreen.boxLabels[index]}
                    </label>
                    <div className="passcode-input-wrap" data-status={status}>
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        id={inputId}
                        name={`passcode-${index + 1}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        enterKeyHint={index < 2 ? 'next' : 'go'}
                        aria-invalid={isInvalid ? 'true' : undefined}
                        className="passcode-input"
                        value={val}
                        placeholder="••"
                        onChange={(e) => handleChange(index, e.target.value)}
                        onPaste={(e) => handlePaste(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onCompositionEnd={(e) => {
                          lastCompositionEndAt.current = e.timeStamp;
                        }}
                      />
                      {status === 'matched' && (
                        <span
                          className="slot-badge slot-badge-ok"
                          aria-label="Matched"
                        >
                          <Check size={12} strokeWidth={2.4} aria-hidden="true" />
                        </span>
                      )}
                      {status === 'error' && (
                        <span
                          className="slot-badge slot-badge-err"
                          aria-hidden="true"
                        >
                          !
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div
            id={errorId}
            role="status"
            aria-live="polite"
            className={`passcode-error ${errorMessage ? 'is-visible' : ''}`}
          >
            {errorMessage && (
              <>
                <AlertCircle size={16} strokeWidth={2} aria-hidden="true" />
                <span>{errorMessage}</span>
              </>
            )}
          </div>

          <button type="submit" className="unlock-button">
            <span>{config.lockScreen.submitLabel}</span>
            <ArrowRight size={18} strokeWidth={1.85} aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
