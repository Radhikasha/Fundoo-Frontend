import { LabelResponseDTO } from './label.model';

export interface NoteCreateDTO {
  title: string;
  content: string;
  color?: string;
}

export interface NoteUpdateDTO {
  title?: string;
  content?: string;
  color?: string;
}

export interface NoteResponseDTO {
  id: number;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  createdAt: string;
  updatedAt: string;
  ownerEmail: string;
  collaborators: string[];
  labels: LabelResponseDTO[];
  reminder?: string; // ISO date string from backend (LocalDateTime serialized as string)
}
