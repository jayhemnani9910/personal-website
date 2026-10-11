/**
 * Day of the year in local time, 1 on 1 January. Counted on calendar dates in
 * UTC, so a 23- or 25-hour day at a DST change still counts as one day and the
 * pick turns over at midnight, when the countdown says it does.
 */
export function dayOfYear(d: Date): number {
  return (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5;
}
