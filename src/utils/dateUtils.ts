const MONGOLIAN_WEEKDAYS = [
  'Ням',
  'Даваа',
  'Мягмар',
  'Лхагва',
  'Пүрэв',
  'Баасан',
  'Бямба',
] as const;

const MONGOLIAN_MONTHS = [
  '1-р сар',
  '2-р сар',
  '3-р сар',
  '4-р сар',
  '5-р сар',
  '6-р сар',
  '7-р сар',
  '8-р сар',
  '9-р сар',
  '10-р сар',
  '11-р сар',
  '12-р сар',
] as const;

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function shiftDateString(dateStr: string, offsetDays: number): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return getTodayDateString();
  }
  const [y, m, d] = parts;
  const utc = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const ny = utc.getUTCFullYear();
  const nm = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(utc.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export function getMongolianWeekday(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return '';
  const [y, m, d] = parts;
  const utc = new Date(Date.UTC(y, m - 1, d));
  return MONGOLIAN_WEEKDAYS[utc.getUTCDay()];
}

export function isWeekendDate(dateStr: string): boolean {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;
  const [y, m, d] = parts;
  const utc = new Date(Date.UTC(y, m - 1, d));
  const day = utc.getUTCDay();
  return day === 0 || day === 6;
}

export function getMongolianMonthTitle(year: number, monthIndex0: number): string {
  return `${year} оны ${MONGOLIAN_MONTHS[monthIndex0] || ''}`;
}

export function formatShortMongolianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export interface CalendarCell {
  dateStr: string | null;
  dayNumber: number | null;
  isWeekend: boolean;
}

/**
 * Returns Monday-first calendar grid cells for the given year & 0-based month.
 */
export function getCalendarCellsForMonth(year: number, monthIndex0: number): CalendarCell[] {
  const firstDayUtc = new Date(Date.UTC(year, monthIndex0, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startOffset = (firstDayUtc.getUTCDay() + 6) % 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ dateStr: null, dayNumber: null, isWeekend: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(monthIndex0 + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    const dayOfWeek = new Date(Date.UTC(year, monthIndex0, day)).getUTCDay();
    cells.push({
      dateStr,
      dayNumber: day,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Pad trailing cells to complete the last week row
  while (cells.length % 7 !== 0) {
    cells.push({ dateStr: null, dayNumber: null, isWeekend: false });
  }

  return cells;
}
