import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioItem } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['../common-styles.css', './portfolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioComponent implements OnInit {
  // Signal for portfolio data
  portfolio = signal<PortfolioItem[]>([]);

  // Signal for loading state
  isLoading = signal(true);

  // Signal for error state
  error = signal<string | null>(null);

  // Signal for search filter
  searchSymbol = signal('');

  // Signal for consideration filter buttons
  considerationFilter = signal<'A' | 'B' | 'C' | 'D' | 'ALL'>('ALL');

  // Signal for CAP filter
  capFilter = signal<string>('ALL');

  // Computed signal for filtered portfolio
  filteredPortfolio = computed(() => {
    const allItems = this.portfolio();
    const search = this.searchSymbol().toLowerCase();
    const filter = this.considerationFilter();
    const capVal = this.capFilter();

    const filtered = allItems.filter(item => {
      const stock = item.masterdata;
      const matchesSearch = !search ||
        stock.symbol.toLowerCase().includes(search) ||
        stock.companyname.toLowerCase().includes(search);
      const consideration = this.getConsideration(stock);
      const matchesConsideration = filter === 'ALL' || consideration === filter;
      const matchesCap = capVal === 'ALL' || stock.capital === capVal;
      return matchesSearch && matchesConsideration && matchesCap;
    });

    return filtered.sort((a, b) => {
      const left = this.getConsideration(a.masterdata);
      const right = this.getConsideration(b.masterdata);
      return left.localeCompare(right);
    });
  });

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.fetchPortfolio();
  }

  private fetchPortfolio(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.portfolioService.getPortfolio().subscribe({
      next: (data) => {
        this.portfolio.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading portfolio:', err);
        this.error.set('Failed to load portfolio data. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }


  clearSearch(): void {
    this.searchSymbol.set('');
  }

  /**
   * Determines the background color class based on manual rating and prices
   * For rating 'D', applies red styling with red font color
   */
  getRowClass(item: PortfolioItem): string {
    const stock = item.masterdata;
    if (stock.manualrating === 'D') {
      return 'row-red';
    }

    if (stock.manualrating === 'Auto') {
      const currentPrice = parseFloat(stock.currentprice);
      const bestPrice = parseFloat(stock.bestprice);
      const overPrice = parseFloat(stock.overprice);

      if (currentPrice < bestPrice) {
        return 'row-green';
      }

      if (currentPrice > bestPrice && currentPrice < overPrice) {
        return 'row-blue';
      }

      return 'row-amber';
    }

    // Default styling for other ratings
    return '';
  }

  /**
   * Determines the current consideration value for the row.
   */
  getConsideration(stock: any): 'A' | 'B' | 'C' | 'D' {
    if (stock.manualrating === 'D') {
      return 'D';
    }

    if (stock.manualrating === 'Auto') {
      const currentPrice = parseFloat(stock.currentprice);
      const bestPrice = parseFloat(stock.bestprice);
      const overPrice = parseFloat(stock.overprice);

      if (currentPrice < bestPrice) {
        return 'A';
      }

      if (currentPrice > bestPrice && currentPrice < overPrice) {
        return 'B';
      }

      return 'C';
    }

    return 'C';
  }

  getConsiderationClass(item: PortfolioItem): string {
    return `consideration-${this.getConsideration(item.masterdata).toLowerCase()}`;
  }

  setConsiderationFilter(filter: 'A' | 'B' | 'C' | 'D' | 'ALL'): void {
    this.considerationFilter.set(filter);
  }

  setCapFilter(cap: string): void {
    this.capFilter.set(cap);
  }

  // Computed signal for unique CAP values
  uniqueCapValues = computed(() => {
    const allItems = this.portfolio();
    const caps = new Set(allItems.map(item => item.masterdata.capital));
    return Array.from(caps).sort();
  });

  /**
   * Format price for display
   */
  formatPrice(price: string): string {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '-' : '₹' + numPrice.toFixed(2);
  }
}