import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { UserDTO } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private handleResponse(res: string): any {
    if (!res) return {};
    try {
      return JSON.parse(res);
    } catch (e) {
      return { success: true, message: res, data: res };
    }
  }

  register(userDTO: UserDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userDTO, { responseType: 'text' }).pipe(
      map(res => this.handleResponse(res))
    );
  }

  login(credentials: { email: string; password?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials, { responseType: 'text' }).pipe(
      map(res => this.handleResponse(res))
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email }, { responseType: 'text' }).pipe(
      map(res => this.handleResponse(res))
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, newPassword }, { responseType: 'text' }).pipe(
      map(res => this.handleResponse(res))
    );
  }
}
