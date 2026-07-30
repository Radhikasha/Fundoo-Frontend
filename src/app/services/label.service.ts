import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { LabelDTO, LabelResponseDTO } from '../models/label.model';
import { NoteResponseDTO } from '../models/note.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private baseUrl = `${environment.apiUrl}/labels`;

  constructor(private http: HttpClient) {}

  getAllLabels(): Observable<ApiResponse<LabelResponseDTO[]>> {
    return this.http.get<ApiResponse<LabelResponseDTO[]>>(this.baseUrl);
  }

  createLabel(labelDTO: LabelDTO): Observable<ApiResponse<LabelResponseDTO>> {
    return this.http.post<ApiResponse<LabelResponseDTO>>(this.baseUrl, labelDTO);
  }

  updateLabel(id: number, labelDTO: LabelDTO): Observable<ApiResponse<LabelResponseDTO>> {
    return this.http.put<ApiResponse<LabelResponseDTO>>(`${this.baseUrl}/${id}`, labelDTO);
  }

  deleteLabel(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  addLabelToNote(labelId: number, noteId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${labelId}/notes/${noteId}`, {});
  }

  removeLabelFromNote(labelId: number, noteId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${labelId}/notes/${noteId}`);
  }

  getNotesByLabel(labelId: number): Observable<ApiResponse<NoteResponseDTO[]>> {
    return this.http.get<ApiResponse<NoteResponseDTO[]>>(`${this.baseUrl}/${labelId}/notes`);
  }
}
