import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../services/stock.service';
import { CommonService } from '../../services/common.service';
import { Stock } from '../../models/stock.model';
import { API_CONFIG } from '../../config/api.config';

@Component({
  selector: 'app-stock-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-analysis.component.html',
  styleUrls: ['../common-styles.css', './stock-analysis.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockAnalysisComponent implements OnInit {
  // Signal for stocks data
  stocks = signal<Stock[]>([]);

  // Signal for loading state
  isLoading = signal(true);

  apiConfig = API_CONFIG;

  // Signal for error state
  error = signal<string | null>(null);

  // Signal for search filter
  searchSymbol = signal('');

  // Signal for consideration filter buttons
  considerationFilter = signal<'A' | 'B' | 'C' | 'D'  | 'P'| 'ALL'>('ALL');

  // Signal for CAP filter
  capFilter = signal<string>('ALL');

  // Signal for favourite filter
  favouriteFilter = signal<'ALL' | 'FAVOURITE'>('ALL');

  // Computed signal for filtered stocks
  filteredStocks = computed(() => {
    const allStocks = this.stocks();
    const search = this.searchSymbol().toLowerCase();
    const filter = this.considerationFilter();
    const capVal = this.capFilter();
    const favFilter = this.favouriteFilter();

    const filtered = allStocks.filter(stock => {
    const matchesSearch = !search ||
        stock.symbol.toLowerCase().includes(search) ||
        stock.companyname.toLowerCase().includes(search) ||
        stock.sector.toLowerCase().includes(search);

      const consideration = this.getConsideration(stock);
      const matchesConsideration = filter === 'ALL' || consideration === filter;
      const matchesCap = capVal === 'ALL' || stock.capital === capVal;
      const matchesFavourite = favFilter === 'ALL' || stock.favourite;
      return matchesSearch && matchesConsideration && matchesCap && matchesFavourite;
    });

    return filtered.sort((a, b) => {
      const considerationCompare = this.getConsideration(a)
        .localeCompare(this.getConsideration(b));
      if (considerationCompare !== 0) return considerationCompare;

      const companyCompare = (a.companyname || '')
        .localeCompare(b.companyname || '');
      if (companyCompare !== 0) return companyCompare;

      const sectorCompare = (a.sector || '')
        .localeCompare(b.sector || '');
      if (sectorCompare !== 0) return sectorCompare;

      return a.symbol.localeCompare(b.symbol);
    });
  });

  constructor(private stockService: StockService, private commonService: CommonService) {}

  ngOnInit(): void {
    this.fetchStocks();
  }

  private fetchStocks(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.stockService.getStocks().subscribe({
      next: (data) => {
        this.stocks.set(Array.isArray(data) ? data.map(stock => ({ ...stock, favourite: stock.favourite || false })) : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading stocks:', err);
        this.error.set('Failed to load stock data. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Determines the background color class based on manual rating and prices
   * For rating 'D', applies red styling with red font color
   */
  getRowClass(stock: Stock): string {
    return this.commonService.getConsideration(stock).rowClass;
  }

  /**
   * Determines the current consideration value for the row.
   */
  getConsideration(stock: Stock): 'A' | 'B' | 'C' | 'D'  | 'P'{
    return this.commonService.getConsideration(stock).rating as 'A' | 'B' | 'C' | 'D';
  }

  clearSearch(): void {
    this.searchSymbol.set('');
  }

  getConsiderationClass(stock: Stock): string {
    return `consideration-${this.getConsideration(stock).toLowerCase()}`;
  }

  setConsiderationFilter(filter: 'A' | 'B' | 'C' | 'D'  | 'P'| 'ALL'): void {
    this.considerationFilter.set(filter);
  }

  setCapFilter(cap: string): void {
    this.capFilter.set(cap);
  }

  setFavouriteFilter(filter: 'ALL' | 'FAVOURITE'): void {
    this.favouriteFilter.set(filter);
  }

  // Computed signal for unique CAP values
  uniqueCapValues = computed(() => {
    const allStocks = this.stocks();
    const caps = new Set(allStocks.map(stock => stock.capital));
    return Array.from(caps).sort();
  });

  /**
   * Format price for display
   */
  formatPrice(price: string): string {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '-' : '₹' + numPrice.toFixed(2);
  }

  toggleFavourite(stock: Stock): void {
    this.stockService.toggleFavourite(stock.id).subscribe({
      next: () => {
        // Toggle the favourite status
        this.stocks.update(stocks =>
          stocks.map(s => s.id === stock.id ? { ...s, favourite: !s.favourite } : s)
        );
      },
      error: (err) => {
        console.error('Error toggling favourite:', err);
        // Optionally show an error message
        this.error.set('Failed to update favourite status. Please try again.');
      }
    });
  }
}
