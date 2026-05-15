import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="container-fluid">
        <div class="header-content">
          <h1 class="h1-header">My Paisa Master</h1>
          <nav class="app-nav">
            <ul class="nav-list">
              <li><a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a></li>
              <li><a routerLink="/portfolio" routerLinkActive="active" class="nav-link">Portfolio</a></li>
              <li><a routerLink="/sectorwise" routerLinkActive="active" class="nav-link">Sectorwise</a></li>
              <li><a routerLink="/profile" routerLinkActive="active" class="nav-link">Profile</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .h1-header {
      color: white;
      margin: 0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-header {
      background: linear-gradient(135deg, #764ba2 40%, #9d8189 70%);
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

    .app-nav {
      margin-left: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.25);
      border-bottom: 2px solid white;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .app-header h1 {
        font-size: 1.5rem;
      }

      .app-header {
        padding: 1.5rem 0;
        margin-bottom: 1rem;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .app-nav {
        margin-left: 0;
      }

      .nav-list {
        gap: 1rem;
      }

      .nav-link {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
      }
    }
  `]
})
export class AppHeaderComponent {}
