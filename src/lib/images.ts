/** Image helpers for the browser tools. Everything happens in memory, on the device. */

export const isHeicFile = (f: File) => /image\/hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name);
export const isImageFile = (f: File) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|hei[cf])$/i.test(f.name);

/**
 * Opens a photo as a bitmap, honouring the rotation saved by the camera.
 * HEIC (iPhone) works natively in Safari; elsewhere the decoder (about 3 MB) is
 * downloaded the first time it is needed and the photo is converted to JPEG.
 */
export async function openImage(file: File): Promise<{ bitmap: ImageBitmap; source: Blob }> {
  try {
    return { bitmap: await createImageBitmap(file, { imageOrientation: 'from-image' }), source: file };
  } catch (err) {
    if (!isHeicFile(file)) throw err;
  }
  const { heicTo } = await import('heic-to/csp');
  const jpeg = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 });
  return { bitmap: await createImageBitmap(jpeg), source: jpeg };
}

/** Fits a w×h box inside maxW×maxH keeping the proportions. */
export function fit(w: number, h: number, maxW: number, maxH: number) {
  const k = Math.min(maxW / w, maxH / h);
  return { w: w * k, h: h * k };
}

/**
 * Draws a bitmap on a canvas no bigger than `maxSide` pixels and returns it as JPEG.
 * Transparent areas (PNG) become white, like paper.
 */
export async function toJpeg(bitmap: ImageBitmap, maxSide: number, quality: number): Promise<Blob> {
  const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * k);
  const h = Math.round(bitmap.height * k);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', quality));
  canvas.width = canvas.height = 0; // free the memory right away (matters on phones)
  if (!blob) throw new Error('No se pudo generar la imagen');
  return blob;
}

/** Small preview for lists. */
export async function thumbnail(bitmap: ImageBitmap, size = 88): Promise<string> {
  return URL.createObjectURL(await toJpeg(bitmap, size, 0.7));
}
