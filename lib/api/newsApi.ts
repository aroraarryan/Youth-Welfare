export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  location?: string;
  publishedAt?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsListResponse {
  data: NewsItem[];
  meta: NewsMeta;
}

export async function fetchNewsList(params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<NewsListResponse> {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.search) sp.set('search', params.search);
  const res = await fetch(`/api/news?${sp.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function fetchNewsItem(id: string): Promise<{ data: NewsItem }> {
  const res = await fetch(`/api/news/${id}`);
  if (!res.ok) throw new Error('News item not found');
  return res.json();
}
