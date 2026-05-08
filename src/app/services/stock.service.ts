import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Stock } from '../models/stock.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private baseUrl = API_CONFIG.baseUrl;
  private authToken = API_CONFIG.authToken;
  private userId = API_CONFIG.userId;
  private requestTimeoutMs = API_CONFIG.requestTimeoutMs;

  constructor(private http: HttpClient) {}

  getStocks(): Observable<Stock[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.authToken}`
    });

    const body = {
      user_id: this.userId
    };

    return this.http.post<Stock[]>(this.baseUrl + '/share/masterdata/getuser', body, { headers }).pipe(
      timeout(this.requestTimeoutMs),
      catchError((error) => {
        console.error('Error fetching stocks:', error);
        return throwError(() => new Error('Failed to fetch stock data'));
      })
    );
  }

  toggleFavourite(masterdataId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.authToken}`
    });

    const body = {
      user_id: this.userId,
      masterdata_id: masterdataId
    };

    return this.http.post(this.baseUrl + '/share/favourites/createOrDelete', body, { headers }).pipe(
      timeout(this.requestTimeoutMs),
      catchError((error) => {
        console.error('Error toggling favourite:', error);
        return throwError(() => new Error('Failed to toggle favourite'));
      })
    );
  }
}
