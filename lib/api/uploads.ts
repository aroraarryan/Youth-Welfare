/**
 * Shared file upload utility. Branches by NEXT_PUBLIC_STORAGE_PROVIDER:
 * - "azure" (prod only): mints a short-lived SAS token from the backend,
 *   then PUTs the file directly to Azure Blob Storage.
 * - unset (staging/local, default): uploads directly to Cloudinary,
 *   same as every call site did individually before this was consolidated.
 */

export type UploadResourceType = 'image' | 'raw' | 'video';

interface UploadOptions {
  folder: string;
  resourceType?: UploadResourceType;
}

async function uploadToAzure(file: File, folder: string): Promise<string | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/sas-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, filename: file.name, contentType: file.type }),
  });
  if (!res.ok) return null;
  const { data } = await res.json();
  if (!data?.uploadUrl) return null;

  const putRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });
  return putRes.ok ? data.blobUrl : null;
}

async function uploadToCloudinary(
  file: File,
  resourceType: UploadResourceType = 'image',
): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) return null;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);
  if (resourceType === 'raw') fd.append('resource_type', 'raw');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: 'POST', body: fd },
  );
  const data = await res.json();
  return data.secure_url ?? null;
}

export async function uploadFile(file: File, options: UploadOptions): Promise<string | null> {
  const { folder, resourceType = 'image' } = options;
  if (process.env.NEXT_PUBLIC_STORAGE_PROVIDER === 'azure') {
    return uploadToAzure(file, folder);
  }
  return uploadToCloudinary(file, resourceType);
}
