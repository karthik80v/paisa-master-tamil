import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PortfolioItem } from '../models/portfolio.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private baseUrl = API_CONFIG.baseUrl;
  private authToken = API_CONFIG.authToken;
  private userId = API_CONFIG.userId;
  private requestTimeoutMs = API_CONFIG.requestTimeoutMs;

  constructor(private http: HttpClient) {}

  getPortfolio(): Observable<PortfolioItem[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.authToken}`
    });

    const body = {
      user_id: this.userId
    };

    return this.http.post<PortfolioItem[]>(this.baseUrl + '/share/favourites/getuser', body, { headers }).pipe(
      timeout(this.requestTimeoutMs),
      catchError((error) => {
        console.error('Error fetching portfolio:', error);
        return throwError(() => new Error('Failed to fetch portfolio data'));
      })
    );
  }
}