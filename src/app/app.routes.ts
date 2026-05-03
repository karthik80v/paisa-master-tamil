import { Routes } from '@angular/router';
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';

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
    path: '**',
    redirectTo: ''
  }
];
