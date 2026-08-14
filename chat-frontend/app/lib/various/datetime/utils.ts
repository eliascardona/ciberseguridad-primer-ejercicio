export function formatISODateToLocate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
