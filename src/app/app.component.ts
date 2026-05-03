import { Component } from '@angular/core';
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StockAnalysisComponent],
  template: `
    <div class="app-wrapper">
      <header class="app-header">
        <div class="container-fluid">
          <h1>Paisa Master - Stock Analysis Dashboard</h1>
          <p class="subtitle">Real-time stock data and analysis</p>
        </div>
      </header>
      <main class="app-main">
        <app-stock-analysis></app-stock-analysis>
      </main>
      <footer class="app-footer">
        <div class="container-fluid">
          <p>&copy; 2026 Paisa Master. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f5f7fa;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .app-header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 1rem;
      opacity: 0.9;
    }

    .app-main {
      flex: 1;
      padding: 0;
    }

    .app-footer {
      background-color: #2c3e50;
      color: white;
      padding: 2rem 0;
      margin-top: 3rem;
      text-align: center;
    }

    .app-footer p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .app-header h1 {
        font-size: 1.5rem;
      }

      .app-header {
        padding: 1.5rem 0;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'paisa-master-app';
}
