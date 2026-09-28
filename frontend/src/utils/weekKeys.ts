export const getWeekKey = (now: Date = new Date()): string => {
  const d = new Date(now);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export const getPreviousWeekKey = (now: Date = new Date()): string => {
  const prev = new Date(now);
  prev.setDate(prev.getDate() - 7);
  return getWeekKey(prev);
};

export const getDayKey = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getWeekDayKeys = (weekKey: string): string[] => {
  const [y, m, d] = weekKey.split("-").map(Number);
  if (!y || !m || !d) return [];
  const start = new Date(y, m - 1, d);
  const days: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(getDayKey(day));
  }
  return days;
};
