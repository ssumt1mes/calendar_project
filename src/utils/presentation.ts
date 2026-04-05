export const formatRelativeTimestamp = (value?: string): string => {
  if (!value) {
    return '기록 없음';
  }

  const target = new Date(value).getTime();
  if (Number.isNaN(target)) {
    return '기록 없음';
  }

  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
};

export const formatAbsoluteTimestamp = (value?: string): string => {
  if (!value) {
    return '아직 저장 기록이 없습니다';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '아직 저장 기록이 없습니다';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
