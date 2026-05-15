import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioItem } from '../../models/portfolio.model';
import { API_CONFIG } from '../../config/api.config';

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

  apiConfig = API_CONFIG;

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

  // Signal for tracking which row is in edit mode
  editingRowId = signal<number | null>(null);

  // Signal for the edited stock value
  editingRowValue = signal<string>('');

  // Signal for tracking save/loading state
  savingRowId = signal<number | null>(null);

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
        stock.companyname.toLowerCase().includes(search) ||
        stock.sector.toLowerCase().includes(search);

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

  constructor(private portfolioService: PortfolioService, private cdr: ChangeDetectorRef) {}

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

  protected getTotalInvested(): number {
    var total = 0;
    this.portfolio().forEach(item => {
      const price = parseFloat(item.masterdata.currentprice);
      const quantity = parseFloat(item.noofstocks);
      if (!isNaN(price) && !isNaN(quantity)) {
        total += price * quantity;
      }
    });

    return total;
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

  /**
   * Start editing a row's stock count
   */
  startEditingRow(itemId: number, currentValue: string): void {
    this.editingRowId.set(itemId);
    this.editingRowValue.set(currentValue);
  }

  /**
   * Cancel editing and revert changes
   */
  cancelEditing(): void {
    this.editingRowId.set(null);
    this.editingRowValue.set('');
  }

  /**
   * Save the updated stock count via API
   */
  saveStockCount(item: PortfolioItem, newValue: string): void {
    const numValue = parseInt(newValue, 10);

    if (isNaN(numValue) || numValue < 0) {
      this.error.set('Please enter a valid number for stock count.');
      return;
    }

    this.savingRowId.set(item.id);

    this.portfolioService.updateStockCount(item.id, numValue).subscribe({
      next: (response) => {
        console.log('Stock count updated successfully:', response);
        // Update the local portfolio data
        const updatedPortfolio = this.portfolio().map(p =>
          p.id === item.id ? { ...p, noofstocks: newValue } : p
        );
        this.portfolio.set(updatedPortfolio);
        this.editingRowId.set(null);
        this.editingRowValue.set('');
        this.savingRowId.set(null);
      },
      error: (err) => {
        console.error('Error updating stock count:', err);
        this.error.set('Failed to update stock count. Please try again.');
        this.savingRowId.set(null);
      }
    });
  }
}