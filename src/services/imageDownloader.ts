import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Product } from '../types';

export interface DownloadProgress {
  current: number;
  total: number;
  percent: number;
  currentFile?: string;
}

async function fetchImageAsBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${url}`);
      return null;
    }
    return await response.blob();
  } catch (error) {
    console.warn(`Error fetching image: ${url}`, error);
    return null;
  }
}

function getImageFilename(url: string, index: number): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    if (filename && filename.includes('.')) {
      return filename;
    }
  } catch {
    // Invalid URL
  }
  // Fallback filename
  const extension = url.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
  return `image_${index + 1}.${extension}`;
}

export async function downloadProductImages(
  product: Product,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  const images = product.images;
  if (images.length === 0) {
    throw new Error('No images to download');
  }

  if (images.length === 1) {
    // Single image - download directly
    const blob = await fetchImageAsBlob(images[0]);
    if (!blob) {
      throw new Error('Failed to download image');
    }
    const filename = getImageFilename(images[0], 0);
    saveAs(blob, `${product.sku}_${filename}`);
    return;
  }

  // Multiple images - create ZIP
  const zip = new JSZip();
  const folder = zip.folder(product.sku);
  if (!folder) {
    throw new Error('Failed to create ZIP folder');
  }

  let completed = 0;
  const total = images.length;

  const downloadPromises = images.map(async (url, index) => {
    const filename = getImageFilename(url, index);
    onProgress?.({
      current: completed,
      total,
      percent: (completed / total) * 100,
      currentFile: filename,
    });

    const blob = await fetchImageAsBlob(url);
    if (blob) {
      folder.file(filename, blob);
    }

    completed++;
    onProgress?.({
      current: completed,
      total,
      percent: (completed / total) * 100,
      currentFile: filename,
    });
  });

  await Promise.all(downloadPromises);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${product.sku}_images.zip`);
}

export async function downloadBatchImages(
  products: Product[],
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  const zip = new JSZip();

  let completed = 0;
  const total = products.reduce((sum, p) => sum + p.images.length, 0);

  for (const product of products) {
    if (product.images.length === 0) continue;

    const folder = zip.folder(product.sku);
    if (!folder) continue;

    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];
      const filename = getImageFilename(url, i);

      onProgress?.({
        current: completed,
        total,
        percent: (completed / total) * 100,
        currentFile: `${product.sku}/${filename}`,
      });

      const blob = await fetchImageAsBlob(url);
      if (blob) {
        folder.file(filename, blob);
      }

      completed++;
    }
  }

  onProgress?.({
    current: total,
    total,
    percent: 100,
    currentFile: 'Creating ZIP...',
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(zipBlob, `product_images_${timestamp}.zip`);
}

export function copyDescription(product: Product, format: 'plain' | 'html'): void {
  // Combine both short and long descriptions
  const parts: string[] = [];

  if (product.shortDescription) {
    parts.push(product.shortDescription);
  }
  if (product.longDescription) {
    parts.push(product.longDescription);
  }

  const description = parts.join('\n\n');

  if (format === 'html') {
    // Copy as HTML with proper separation
    const htmlContent = parts.join('<br><br>');
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const item = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([stripHtml(description)], { type: 'text/plain' }) });
    navigator.clipboard.write([item]);
  } else {
    // Copy as plain text
    navigator.clipboard.writeText(stripHtml(description));
  }
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}
