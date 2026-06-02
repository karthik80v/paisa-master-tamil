import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PortfolioService } from '../../services/portfolio.service';
import { CommonService } from '../../services/common.service';
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
export class PortfolioComponent implements OnInit, AfterViewChecked {
    @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;
    private shouldFocusInput = false;
  // Signal for portfolio data
  portfolio = signal<PortfolioItem[]>([]);

  apiConfig = API_CONFIG;

  // Signal for loading state
  isLoading = signal(true);

  // Signal for War Room Google Meet link
  warRoomLink = signal<string | null>(null);
  warRoomTitle = signal<string | null>(null);
  warRoomActive = signal<boolean>(false);

  // Signal for error state
  error = signal<string | null>(null);

  // Signal for search filter
  searchSymbol = signal('');

  // Signal for consideration filter buttons
  considerationFilter = signal<'A' | 'B' | 'C' | 'X'  | 'D'| 'ALL'>('ALL');

  // Signal for CAP filter
  capFilter = signal<string>('ALL');

  // Signal for tracking which row is in edit mode
  editingRowId = signal<number | null>(null);

  // Signal for the edited stock value
  editingRowValue = signal<string>('');

  // Signal for tracking save/loading state
  savingRowId = signal<number | null>(null);

  // Sort state
  sortColumn = signal<'consideration' | 'sector' | 'companyname' | 'currentprice' | 'capital' | 'investmentvalue' | 'noofstocks' | ''>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  setSort(column: 'consideration' | 'sector' | 'companyname' | 'currentprice' | 'capital' | 'investmentvalue' | 'noofstocks') {
    if (this.sortColumn() === column) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else {
        // Third click: reset to default sort
        this.sortColumn.set('');
        this.sortDirection.set('asc');
      }
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

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

    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();
    return filtered.sort((a, b) => {
      let result = 0;
      if (sortCol) {
        switch (sortCol) {
          case 'consideration':
            result = this.getConsideration(a.masterdata).localeCompare(this.getConsideration(b.masterdata));
            break;
          case 'sector':
            result = (a.masterdata.sector || '').localeCompare(b.masterdata.sector || '');
            break;
          case 'companyname':
            result = (a.masterdata.companyname || '').localeCompare(b.masterdata.companyname || '');
            break;
          case 'currentprice':
            result = (parseFloat(a.masterdata.currentprice) || 0) - (parseFloat(b.masterdata.currentprice) || 0);
            break;
          case 'capital':
            result = (a.masterdata.capital || '').localeCompare(b.masterdata.capital || '');
            break;
          case 'investmentvalue': {
            const aVal = (parseFloat(a.noofstocks) || 0) * (parseFloat(a.masterdata.currentprice) || 0);
            const bVal = (parseFloat(b.noofstocks) || 0) * (parseFloat(b.masterdata.currentprice) || 0);
            result = aVal - bVal;
            break;
          }
          case 'noofstocks':
            result = (parseFloat(a.noofstocks) || 0) - (parseFloat(b.noofstocks) || 0);
            break;
        }
        if (sortDir === 'desc') result = -result;
        if (result !== 0) return result;
      }
      // Default sort fallback
      const considerationCompare = this.getConsideration(a.masterdata)
        .localeCompare(this.getConsideration(b.masterdata));
      if (considerationCompare !== 0) return considerationCompare;

      const companyCompare = (a.masterdata.companyname || '')
        .localeCompare(b.masterdata.companyname || '');
      if (companyCompare !== 0) return companyCompare;

      const sectorCompare = (a.masterdata.sector || '')
        .localeCompare(b.masterdata.sector || '');
      if (sectorCompare !== 0) return sectorCompare;

      return a.masterdata.symbol.localeCompare(b.masterdata.symbol);
    });
  });

  constructor(private portfolioService: PortfolioService, private cdr: ChangeDetectorRef, private commonService: CommonService, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPortfolio();
    this.fetchWarRoomLink();
  }

  private fetchWarRoomLink(): void {
    this.http.get<any[]>('https://paisamastertamil.com/share/testimonial/full').subscribe({
      next: (items) => {
        const warRoomItem = items?.find(item =>
          item.title?.toLowerCase().includes('war room') ||
          item.description?.toLowerCase().includes('war room')
        );
        if (warRoomItem) {
          const meetMatch = (warRoomItem.description || '').match(/https:\/\/meet\.google\.com\/[^\s]+/);
          if (meetMatch) {
            this.warRoomLink.set(meetMatch[0]);
            this.warRoomTitle.set(warRoomItem.title || 'Open War Room');
            this.warRoomActive.set(this.isWarRoomInProgress(warRoomItem.title || ''));
            this.cdr.markForCheck();
          }
        }
      },
      error: (err) => console.error('Error fetching testimonials:', err)
    });
  }

  private isWarRoomInProgress(title: string): boolean {
    // Example title: "War Room On 7th June 2026 @9AM to12PM"
    const dateMatch = title.match(/(\d{1,2})(?:st|nd|rd|th)\s+(\w+)\s+(\d{4})/i);
    const timeMatch = title.match(/@(\d{1,2}(?::\d{2})?(?:AM|PM))\s*to\s*(\d{1,2}(?::\d{2})?(?:AM|PM))/i);

    if (!dateMatch || !timeMatch) return false;

    const day = parseInt(dateMatch[1], 10);
    const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const month = monthNames.indexOf(dateMatch[2].toLowerCase());
    const year = parseInt(dateMatch[3], 10);
    if (month === -1) return false;

    const parseTime = (t: string): { h: number; m: number } => {
      const tm = t.match(/(\d{1,2})(?::(\d{2}))?(AM|PM)/i);
      if (!tm) return { h: 0, m: 0 };
      let h = parseInt(tm[1], 10);
      const m = tm[2] ? parseInt(tm[2], 10) : 0;
      const ampm = tm[3].toUpperCase();
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return { h, m };
    };

    const start = parseTime(timeMatch[1]);
    const end = parseTime(timeMatch[2]);

    // IST = UTC+5:30; treat extracted hours/minutes as IST and convert to UTC
    const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
    const startUTC = new Date(Date.UTC(year, month, day, start.h, start.m) - IST_OFFSET_MS);
    const endUTC   = new Date(Date.UTC(year, month, day, end.h,   end.m)   - IST_OFFSET_MS);

    const now = new Date();
    return now >= startUTC && now <= endUTC;
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
    return this.commonService.getConsideration(item.masterdata).rowClass;
  }

  /**
   * Determines the current consideration value for the row.
   */
  getConsideration(stock: any): 'A' | 'B' | 'C' | 'X'  | 'D'{
    return this.commonService.getConsideration(stock).rating as 'A' | 'B' | 'C' | 'X'; 
  }

  getConsiderationClass(item: PortfolioItem): string {
    return `consideration-${this.getConsideration(item.masterdata).toLowerCase()}`;
  }

  setConsiderationFilter(filter: 'A' | 'B' | 'C' | 'X'  | 'D'| 'ALL'): void {
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
    this.shouldFocusInput = true;
  }
  ngAfterViewChecked(): void {
    if (this.shouldFocusInput && this.editInput) {
      this.editInput.nativeElement.focus();
      this.shouldFocusInput = false;
    }
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