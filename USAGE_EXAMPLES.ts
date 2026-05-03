// Example: How to use StockAnalysisComponent in your app
// This file shows integration patterns

import { Component } from '@angular/core';
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';
import { HttpClientModule } from '@angular/common/http';

/**
 * PATTERN 1: Using as a Standalone Component in Standalone App
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StockAnalysisComponent, HttpClientModule],
  template: `
    <div class="app-container">
      <app-stock-analysis></app-stock-analysis>
    </div>
  `,
  styles: [`
    .app-container {
      background-color: #f5f5f5;
      min-height: 100vh;
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  constructor() {}
}

/**
 * PATTERN 2: Wrapping in a Dashboard Component
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StockAnalysisComponent, HttpClientModule],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Finance Dashboard</h1>
      </header>
      <main>
        <app-stock-analysis></app-stock-analysis>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
    }
    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }
    main {
      flex: 1;
      padding: 2rem;
    }
  `]
})
export class DashboardComponent {}

/**
 * PATTERN 3: In NgModule-based Application
 * (For backwards compatibility with existing apps)
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    // Your components
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    StockAnalysisComponent  // Import standalone component directly
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

/**
 * PATTERN 4: Lazy Loading with Routing
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'stocks',
    loadComponent: () => import('./components/stock-analysis/stock-analysis.component')
      .then(m => m.StockAnalysisComponent)
  },
  {
    path: '',
    redirectTo: 'stocks',
    pathMatch: 'full'
  }
];

/**
 * PATTERN 5: With Error Boundary Component
 */
@Component({
  selector: 'app-stock-analysis-wrapper',
  standalone: true,
  imports: [StockAnalysisComponent],
  template: `
    <div class="wrapper">
      @try {
        <app-stock-analysis></app-stock-analysis>
      } @catch (error) {
        <div class="error-boundary">
          <h2>Something went wrong</h2>
          <p>{{ error }}</p>
          <button (click)="reload()">Reload</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .error-boundary {
      padding: 2rem;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      color: #721c24;
      text-align: center;
    }
  `]
})
export class StockAnalysisWrapperComponent {
  reload() {
    window.location.reload();
  }
}

/**
 * PATTERN 6: With Custom Configuration Service
 * (If you need to configure API endpoint at runtime)
 */
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  apiBaseUrl = signal('https://paisamastertamil.com');
  authToken = signal('ABCDEF');
  userId = signal(1234567890);
}

// Then modify StockService to use this:
// constructor(private http: HttpClient, private config: ApiConfigService) {}
// this.apiUrl = `${this.config.apiBaseUrl()}/share/masterdata/getuser`;
