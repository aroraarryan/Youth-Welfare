import { api, PaginatedResponse } from '../api';

export type DocumentCategory = 'FORMS' | 'CIRCULARS' | 'SCHEME_GUIDELINES' | 'REPORTS';

export type FileType = 'PDF' | 'DOCX' | 'XLSX' | 'OTHER';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  fileType: FileType;
  fileUrl: string;
  pages: number | null;
  isPublished: boolean;
  uploadedAt: string;
  updatedAt: string;
}

export const documentsApi = {
  list: (params?: {
    category?: DocumentCategory;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<Document>>('/documents', params),

  get: (id: string) =>
    api.get<{ success: boolean; data: Document }>(`/documents/${id}`),
};
