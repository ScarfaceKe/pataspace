export interface PropertyImageUploadResult {
  ok: boolean;
  fileName: string;
  role: 'property-cover-image' | 'property-gallery-image';
  message?: string;
}

export async function uploadPropertyImageFiles(input: {
  propertyId: string;
  files: File[];
  onProgress?: (message: string) => void;
}): Promise<PropertyImageUploadResult[]> {
  const results: PropertyImageUploadResult[] = [];
  for (let index = 0; index < input.files.length; index += 1) {
    const file = input.files[index];
    const role = index === 0 ? 'property-cover-image' : 'property-gallery-image';
    input.onProgress?.(`Uploading ${file.name} (${index + 1} of ${input.files.length})...`);
    const form = new FormData();
    form.append('propertyId', input.propertyId);
    form.append('role', role);
    form.append('file', file);
    try {
      const response = await fetch('/api/storage/property-images', { method: 'POST', body: form });
      const payload = await response.json().catch(() => ({}));
      results.push({ ok: response.ok, fileName: file.name, role, message: response.ok ? 'Uploaded' : payload.message ?? 'Upload failed.' });
    } catch (error) {
      results.push({ ok: false, fileName: file.name, role, message: error instanceof Error ? error.message : 'Upload failed.' });
    }
  }
  return results;
}

export function summarizeImageUploadResults(results: PropertyImageUploadResult[]): string {
  const successful = results.filter((item) => item.ok).length;
  const failed = results.length - successful;
  if (!results.length) return '';
  if (!failed) return `${successful} image${successful === 1 ? '' : 's'} uploaded successfully.`;
  return `${successful} image${successful === 1 ? '' : 's'} uploaded successfully. ${failed} image${failed === 1 ? '' : 's'} failed and can be retried without losing the form.`;
}
