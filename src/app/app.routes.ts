import { Routes } from '@angular/router';
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { SectorwiseComponent } from './components/sectorwise/sectorwise.component';

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
    path: '**',
    redirectTo: ''
  }
];
