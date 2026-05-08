import { Routes } from '@angular/router';
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';

export const routes: Routes = [
  {
    path: '',
    component: StockAnalysisComponent
  },
  {
    path: 'stocks',
    component: StockAnalysisComponent
  },
  {
    path: 'portfolio',
    component: PortfolioComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
