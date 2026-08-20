const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const absoluteFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

// Formats a "YYYY-MM-DD" day string as e.g. "Aug 19, 2026".
export function formatDay(day: unknown): string {
  if (typeof day !== "string") return "";
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? day : dayFormat.format(date);
}

export function formatAbsoluteTime(date: Date): string {
  return `${absoluteFormat.format(date)} UTC`;
}
