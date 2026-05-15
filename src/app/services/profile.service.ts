import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = API_CONFIG.baseUrl;
  private authToken = API_CONFIG.authToken;
  private userId = API_CONFIG.userId;
  private requestTimeoutMs = API_CONFIG.requestTimeoutMs;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.authToken}`
    });

    return this.http.get<User>(`${this.baseUrl}/share/users/find/${this.userId}`, { headers }).pipe(
      timeout(this.requestTimeoutMs),
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return throwError(() => new Error('Failed to fetch user profile data'));
      })
    );
  }
}
