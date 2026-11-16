export interface ElapsedBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  isBeforeStart: boolean;
}

export interface CountdownBreakdown {
  targetYearNumber: number;
  targetDate: Date;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AnniversaryState {
  elapsed: ElapsedBreakdown;
  countdown: CountdownBreakdown;
  /** True on the calendar anniversary month & day (after year 1+) */
  isAnniversaryToday: boolean;
  /** The year number being celebrated right now (e.g. 6 on 21/11/2026, 7 on 21/11/2027) */
  activeAnniversaryYear: number;
}

function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatOrdinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function toRomanNumeral(num: number): string {
  if (num <= 0) return 'I';
  const map: Array<[number, string]> = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let rem = Math.floor(num);
  let out = '';
  for (const [val, sym] of map) {
    while (rem >= val) {
      out += sym;
      rem -= val;
    }
  }
  return out;
}

/**
 * Computes calendar-accurate elapsed Years, Months, Days, Hours, Minutes,
 * Seconds, and total elapsed days between `startDate` and `now`, accounting
 * for leap years and differing month lengths (28/29/30/31 days).
 */
export function calculateElapsedTime(
  startDate: Date,
  now: Date
): ElapsedBreakdown {
  const diffMs = now.getTime() - startDate.getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      isBeforeStart: diffMs < 0,
    };
  }

  let seconds = now.getSeconds() - startDate.getSeconds();
  let minutes = now.getMinutes() - startDate.getMinutes();
  let hours = now.getHours() - startDate.getHours();
  let dayBorrow = 0;

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    dayBorrow = 1;
  }

  const adjNow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - dayBorrow
  );

  let totalMonths =
    (adjNow.getFullYear() - startDate.getFullYear()) * 12 +
    (adjNow.getMonth() - startDate.getMonth());

  if (adjNow.getDate() < startDate.getDate()) {
    totalMonths -= 1;
  }
  totalMonths = Math.max(0, totalMonths);

  const targetMonthTotal = startDate.getMonth() + totalMonths;
  const anchorYear = startDate.getFullYear() + Math.floor(targetMonthTotal / 12);
  const anchorMonth = ((targetMonthTotal % 12) + 12) % 12;
  const anchorDay = Math.min(
    startDate.getDate(),
    getDaysInMonth(anchorYear, anchorMonth)
  );

  const utcAdjNow = Date.UTC(
    adjNow.getFullYear(),
    adjNow.getMonth(),
    adjNow.getDate()
  );
  const utcAnchor = Date.UTC(anchorYear, anchorMonth, anchorDay);
  const days = Math.max(0, Math.round((utcAdjNow - utcAnchor) / 86_400_000));

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const totalDays = Math.floor(diffMs / 86_400_000);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    isBeforeStart: false,
  };
}

function getAnniversaryDateForYear(startDate: Date, nthYear: number): Date {
  const targetYear = startDate.getFullYear() + nthYear;
  const clampedDay = Math.min(
    startDate.getDate(),
    getDaysInMonth(targetYear, startDate.getMonth())
  );
  return new Date(
    targetYear,
    startDate.getMonth(),
    clampedDay,
    startDate.getHours(),
    startDate.getMinutes(),
    startDate.getSeconds(),
    0
  );
}

/**
 * Computes both the live elapsed relationship time AND the rolling countdown
 * to the next anniversary milestone (e.g. 6th on 21/11/2026 -> automatically
 * switches to 7th on 21/11/2027 once 21/11/2026 arrives).
 */
export function calculateAnniversaryState(
  startDate: Date,
  now: Date
): AnniversaryState {
  const elapsed = calculateElapsedTime(startDate, now);

  let targetYearNumber = Math.max(1, elapsed.years + 1);
  let targetDate = getAnniversaryDateForYear(startDate, targetYearNumber);

  // Guard against boundary seconds where targetDate <= now
  while (targetDate.getTime() <= now.getTime()) {
    targetYearNumber += 1;
    targetDate = getAnniversaryDateForYear(startDate, targetYearNumber);
  }

  const remainingMs = Math.max(0, targetDate.getTime() - now.getTime());
  const totalSecondsLeft = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSecondsLeft / 86_400);
  const hours = Math.floor((totalSecondsLeft % 86_400) / 3600);
  const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
  const seconds = totalSecondsLeft % 60;

  const isAnniversaryToday =
    elapsed.years >= 1 &&
    now.getMonth() === startDate.getMonth() &&
    now.getDate() === startDate.getDate();

  // Before the 6th anniversary (at 5y 11m), display upcoming year 6 in header;
  // once 6+ years are completed, display the live completed year (6, then 7, etc.).
  const activeAnniversaryYear =
    elapsed.years >= 1 && elapsed.months === 0 && elapsed.days === 0
      ? elapsed.years
      : elapsed.years >= 6
        ? elapsed.years
        : targetYearNumber;

  return {
    elapsed,
    countdown: {
      targetYearNumber,
      targetDate,
      days,
      hours,
      minutes,
      seconds,
    },
    isAnniversaryToday,
    activeAnniversaryYear,
  };
}

/**
 * Returns the dynamic hero headline:
 * - Every November before the anniversary day (Nov 1–19):
 *   "Countdown to Happy Anniversary <N>th years"
 * - Every November on/after the anniversary day (Nov 20–30):
 *   "Happy Anniversary <N>th years"
 * - All other months (Dec–Oct): the configured editorial headline.
 */
export function getSeasonalHeroHeading(
  startDate: Date,
  now: Date,
  state: AnniversaryState,
  defaultHeading: string
): string {
  const isAnniversaryMonth = now.getMonth() === startDate.getMonth();
  if (!isAnniversaryMonth) {
    return defaultHeading;
  }

  if (now.getDate() < startDate.getDate()) {
    return `Countdown to Happy Anniversary ${formatOrdinal(state.countdown.targetYearNumber)} years`;
  }

  const celebratedYear = Math.max(1, state.elapsed.years);
  return `Happy Anniversary ${formatOrdinal(celebratedYear)} years`;
}

export interface PastedDistributionResult {
  nextValues: [string, string, string];
  focusIndex: number;
}

/**
 * Distributes pasted digits (e.g. "25 31 20", "25-31-20", "253120") cleanly
 * across the 3 passcode boxes starting at `startIndex` (or from box 0 when 3+ digits).
 */
export function distributePastedDigits(
  rawText: string,
  startIndex: number,
  currentValues: readonly [string, string, string]
): PastedDistributionResult | null {
  const digits = rawText.replace(/\D/g, '');
  if (!digits) return null;

  const next: [string, string, string] = [
    currentValues[0],
    currentValues[1],
    currentValues[2],
  ];

  const effectiveStart = digits.length >= 3 ? 0 : startIndex;
  let cursor = 0;
  let lastTouched = effectiveStart;

  for (let i = effectiveStart; i < 3 && cursor < digits.length; i += 1) {
    next[i] = digits.slice(cursor, cursor + 2);
    cursor += 2;
    lastTouched = i;
  }

  const focusIndex =
    next[lastTouched].length === 2 && lastTouched < 2
      ? lastTouched + 1
      : lastTouched;

  return { nextValues: next, focusIndex };
}
