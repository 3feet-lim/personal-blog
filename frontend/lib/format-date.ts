const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Formats an ISO timestamp as a relative time string in Korean
 * (e.g. "3시간 전", "2일 전"). Falls back to an absolute date once the
 * gap grows large enough that a relative phrase stops being useful.
 */
export function formatRelativeTime(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 0 || diffSeconds < 60) {
    return "방금 전";
  }
  if (diffSeconds < HOUR) {
    return `${Math.floor(diffSeconds / MINUTE)}분 전`;
  }
  if (diffSeconds < DAY) {
    return `${Math.floor(diffSeconds / HOUR)}시간 전`;
  }
  if (diffSeconds < MONTH) {
    return `${Math.floor(diffSeconds / DAY)}일 전`;
  }
  if (diffSeconds < YEAR) {
    return `${Math.floor(diffSeconds / MONTH)}개월 전`;
  }

  return `${Math.floor(diffSeconds / YEAR)}년 전`;
}
