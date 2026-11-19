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
  /** True on the calendar anniversary month & day in Asia/Bangkok (+07:00) */
  isAnniversaryToday: boolean;
  /** The year number being celebrated right now (e.g. 6 on 20/11/2026, 7 on 20/11/2027) */
  activeAnniversaryYear: number;
}

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

interface CalendarParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function toBangkokParts(date: Date): CalendarParts {
  const shifted = new Date(date.getTime() + BANGKOK_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
  };
}

function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
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
 * Seconds, and total elapsed days between `startDate` and `now` anchored to
 * Asia/Bangkok (+07:00), accounting for leap years and variable month lengths.
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

  const start = toBangkokParts(startDate);
  const current = toBangkokParts(now);

  let seconds = current.second - start.second;
  let minutes = current.minute - start.minute;
  let hours = current.hour - start.hour;
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

  const adjNowDate = new Date(
    Date.UTC(current.year, current.month, current.day - dayBorrow)
  );
  const adjYear = adjNowDate.getUTCFullYear();
  const adjMonth = adjNowDate.getUTCMonth();
  const adjDay = adjNowDate.getUTCDate();

  let totalMonths =
    (adjYear - start.year) * 12 + (adjMonth - start.month);

  if (adjDay < start.day) {
    totalMonths -= 1;
  }
  totalMonths = Math.max(0, totalMonths);

  const targetMonthTotal = start.month + totalMonths;
  const anchorYear = start.year + Math.floor(targetMonthTotal / 12);
  const anchorMonth = ((targetMonthTotal % 12) + 12) % 12;
  const anchorDay = Math.min(start.day, getDaysInMonth(anchorYear, anchorMonth));

  const utcAdjNow = Date.UTC(adjYear, adjMonth, adjDay);
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
  const start = toBangkokParts(startDate);
  const targetYear = start.year + nthYear;
  const clampedDay = Math.min(
    start.day,
    getDaysInMonth(targetYear, start.month)
  );
  const utcMs =
    Date.UTC(
      targetYear,
      start.month,
      clampedDay,
      start.hour,
      start.minute,
      start.second
    ) - BANGKOK_OFFSET_MS;
  return new Date(utcMs);
}

/**
 * Computes both the live elapsed relationship time AND the rolling countdown
 * to the next anniversary milestone anchored to Asia/Bangkok (+07:00).
 */
export function calculateAnniversaryState(
  startDate: Date,
  now: Date
): AnniversaryState {
  const elapsed = calculateElapsedTime(startDate, now);
  const start = toBangkokParts(startDate);
  const current = toBangkokParts(now);

  let targetYearNumber = Math.max(1, elapsed.years + 1);
  let targetDate = getAnniversaryDateForYear(startDate, targetYearNumber);

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
    current.month === start.month &&
    current.day === start.day;

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
 * Returns the dynamic hero headline anchored to Asia/Bangkok (+07:00):
 * - Every November (Nov 1–30): "Happy Anniversary <N>th years"
 *   (upcoming year before Nov 20, completed year on/after Nov 20).
 * - All other months (Dec–Oct): the configured editorial headline.
 */
export function getSeasonalHeroHeading(
  startDate: Date,
  now: Date,
  state: AnniversaryState,
  defaultHeading: string
): string {
  const start = toBangkokParts(startDate);
  const current = toBangkokParts(now);

  if (current.month !== start.month) {
    return defaultHeading;
  }

  const displayYear =
    current.day < start.day
      ? state.countdown.targetYearNumber
      : Math.max(1, state.elapsed.years);

  return `Happy Anniversary ${formatOrdinal(displayYear)} years`;
}

export function getBangkokYear(date: Date): number {
  return toBangkokParts(date).year;
}

export function isSameBangkokMonth(a: Date, b: Date): boolean {
  return toBangkokParts(a).month === toBangkokParts(b).month;
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
