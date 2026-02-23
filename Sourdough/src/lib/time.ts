const MINUTES_PER_DAY = 24 * 60;

export function minutesToDateToday(minutes: number): Date {
  const now = new Date();
  const clamped = Math.max(0, Math.min(MINUTES_PER_DAY - 1, minutes));
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setMinutes(clamped);
  return date;
}

export function dateToTodayMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function dayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return 'today';
  }

  if (target.getTime() === tomorrow.getTime()) {
    return 'tomorrow';
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function formatTimeWithDay(date: Date): string {
  return `${formatTime(date)} (${dayLabel(date)})`;
}

export function formatMinutesAsTime(minutes: number): string {
  return formatTime(minutesToDateToday(minutes));
}
