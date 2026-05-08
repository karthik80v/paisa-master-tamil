import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from './components/app-header/app-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppHeaderComponent, RouterOutlet],
  template: `
    <div class="app-wrapper">
      <app-header></app-header>
      <main class="app-main">
        <router-outlet></router-outlet>
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
  `]
})
export class AppComponent {
  title = 'paisa-master-app';
}
