import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { NoteCreateDTO, NoteUpdateDTO, NoteResponseDTO } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private baseUrl = 'http://localhost:8080/api/notes';

  constructor(private http: HttpClient) {}

  getAllNotes(): Observable<ApiResponse<NoteResponseDTO[]>> {
    return this.http.get<ApiResponse<NoteResponseDTO[]>>(this.baseUrl);
  }

  createNote(noteDTO: NoteCreateDTO): Observable<ApiResponse<NoteResponseDTO>> {
    return this.http.post<ApiResponse<NoteResponseDTO>>(this.baseUrl, noteDTO);
  }

  updateNote(id: number, noteDTO: NoteUpdateDTO): Observable<ApiResponse<NoteResponseDTO>> {
    return this.http.put<ApiResponse<NoteResponseDTO>>(`${this.baseUrl}/${id}`, noteDTO);
  }

  deleteNote(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  togglePin(id: number): Observable<ApiResponse<NoteResponseDTO>> {
    return this.http.patch<ApiResponse<NoteResponseDTO>>(`${this.baseUrl}/${id}/pin`, {});
  }

  toggleArchive(id: number): Observable<ApiResponse<NoteResponseDTO>> {
    return this.http.patch<ApiResponse<NoteResponseDTO>>(`${this.baseUrl}/${id}/archive`, {});
  }

  toggleTrash(id: number): Observable<ApiResponse<NoteResponseDTO>> {
    return this.http.patch<ApiResponse<NoteResponseDTO>>(`${this.baseUrl}/${id}/trash`, {});
  }

  getArchivedNotes(): Observable<ApiResponse<NoteResponseDTO[]>> {
    return this.http.get<ApiResponse<NoteResponseDTO[]>>(`${this.baseUrl}/archived`);
  }

  getTrashedNotes(): Observable<ApiResponse<NoteResponseDTO[]>> {
    return this.http.get<ApiResponse<NoteResponseDTO[]>>(`${this.baseUrl}/trash`);
  }

  addCollaborator(noteId: number, email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${noteId}/collaborators`, { email });
  }

  removeCollaborator(noteId: number, email: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${noteId}/collaborators/${email}`);
  }

  getCollaborators(noteId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${noteId}/collaborators`);
  }

  /**
   * Set a reminder on a note.
   * @param reminderTime Local-time ISO string e.g. "2026-07-28T22:54:00" (no Z).
   *   The ReminderPickerComponent already produces local-time strings using toLocalISOString().
   */
  setReminder(noteId: number, reminderTime: string): Observable<ApiResponse<NoteResponseDTO>> {
    // Ensure no trailing Z or milliseconds — backend LocalDateTime expects "YYYY-MM-DDTHH:mm:ss"
    const cleanDT = reminderTime.replace('Z', '').split('.')[0];
    return this.http.patch<ApiResponse<NoteResponseDTO>>(
      `${this.baseUrl}/${noteId}/reminder`,
      { reminderTime: cleanDT }
    );
  }


  /** Remove reminder from a note */
  removeReminder(noteId: number): Observable<ApiResponse<NoteResponseDTO>> {
    return this.http.delete<ApiResponse<NoteResponseDTO>>(`${this.baseUrl}/${noteId}/reminder`);
  }

  /** Get all notes that have a reminder set (not trashed) */
  getNotesWithReminders(): Observable<ApiResponse<NoteResponseDTO[]>> {
    return this.http.get<ApiResponse<NoteResponseDTO[]>>(`${this.baseUrl}/reminders`);
  }
}
