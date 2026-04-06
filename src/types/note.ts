export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface NoteDraft {
  title: string;
  content: string;
  tags: string[];
}

export type SortBy = 'updatedAt' | 'createdAt' | 'title';
export type Theme = 'dark' | 'light';
