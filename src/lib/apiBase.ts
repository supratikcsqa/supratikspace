function normalizeBaseUrl(value: string | undefined) {
  const trimmed = `${value || ''}`.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export function buildApiUrl(path: string) {
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}
