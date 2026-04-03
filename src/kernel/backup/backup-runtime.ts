export function downloadTextFile(filename: string, content: string, contentType = 'application/json'): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const blob = new Blob([content], { type: `${contentType};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
  return true;
}

export async function readTextFile(file: File): Promise<string> {
  return file.text();
}

export function reloadApplication(): void {
  if (typeof window === 'undefined') return;
  const locationRef = window.location as (Location & { reload?: () => void }) | URL;
  if ('reload' in locationRef && typeof locationRef.reload === 'function') {
    locationRef.reload();
  }
}
