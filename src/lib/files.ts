/** Saves a file generated in the browser. Nothing leaves the device. */
export function downloadBlob(data: Blob | Uint8Array, filename: string, type = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser time to start the download before freeing the memory.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** "recibo-octubre.pdf" → "recibo-octubre" */
export const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'archivo';

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

let counter = 0;
export const uid = () => `f${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Moves an item one position up (-1) or down (+1). */
export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const to = index + dir;
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}
