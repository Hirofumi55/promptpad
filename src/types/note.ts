export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface NotesState {
  notes: Note[];
  searchQuery: string;
  selectedTag: string | null;
  sortBy: 'updatedAt' | 'createdAt' | 'title';
}

export type SortBy = 'updatedAt' | 'createdAt' | 'title';
export type Theme = 'dark' | 'light';
