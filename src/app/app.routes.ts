import { Routes } from '@angular/router';
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { SectorwiseComponent } from './components/sectorwise/sectorwise.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: StockAnalysisComponent
  },
  {
    path: 'dashboard',
    component: StockAnalysisComponent
  },
  {
    path: 'portfolio',
    component: PortfolioComponent
  },
  {
    path: 'sectorwise',
    component: SectorwiseComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
