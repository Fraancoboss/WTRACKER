const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

export function formatDate(value?: string | null): string {
  if (!value) return '-';

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('es-ES', DATE_FORMAT_OPTIONS);
  }

  const [datePart] = value.split('T');
  return datePart || value;
}
