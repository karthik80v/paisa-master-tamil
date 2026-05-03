import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Stock } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'https://paisamastertamil.com/share/masterdata/getuser';
  private authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODc3LCJpYXQiOjE3Nzc2NDk3MDMsImV4cCI6MTgwMzU2OTcwM30.zI61VCAUPNvmEoImnyNa6Jy5cDjdv4_qlHKOx9copnk';
  private userId = 877;
  private requestTimeoutMs = 30000;

  constructor(private http: HttpClient) {}

  getStocks(): Observable<Stock[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.authToken}`
    });

    const body = {
      user_id: this.userId
    };

    return this.http.post<Stock[]>(this.apiUrl, body, { headers }).pipe(
      timeout(this.requestTimeoutMs),
      catchError((error) => {
        console.error('Error fetching stocks:', error);
        return throwError(() => new Error('Failed to fetch stock data'));
      })
    );
  }
}
