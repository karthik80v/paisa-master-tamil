# Stock Analysis Component - Implementation Guide

## Overview
A standalone Angular 21 component that fetches and displays stock analysis data from a REST API with advanced filtering, conditional styling, and reactive state management using Signals.

## Features Implemented

### 1. **Standalone Component Architecture**
- Uses Angular 21 standalone components (`standalone: true`)
- No module dependencies required
- Can be imported directly into other standalone components or lazy-loaded

### 2. **Reactive State Management with Signals**
```typescript
signals = signal<Stock[]>([]);           // Stock data
isLoading = signal(true);                // Loading state
error = signal<string | null>(null);     // Error handling
searchSymbol = signal('');               // Search filter
filteredStocks = computed(() => {...});  // Computed filter
```

### 3. **Data Fetching**
- Dedicated `StockService` handles all API calls
- Implements automatic timeout handling (30 seconds)
- Comprehensive error handling with user-friendly messages
- Authorization token support

### 4. **Control Flow with New Syntax**
- `@if` for conditional rendering (loading, error, empty states)
- `@for` with track function for efficient list rendering
- `@else` for fallback UI states

### 5. **Intelligent Table Styling**
- **Red Background (Row)**: Manual Rating = 'D'
- **Green Background (Row)**: Auto Rating + Current Price < Best Price
- **Amber/Orange Background (Row)**: Auto Rating + Current Price > Over Price
- **Blue Background (Row)**: Auto Rating + Default condition
- Lighter color variants for better readability

### 6. **Search Functionality**
- Real-time symbol filtering using computed signal
- Case-insensitive search
- Shows result count
- Maintains full data while filtering display

### 7. **Enhanced UX**
- Loading spinner with message
- Dismissible error alerts
- "No results" messaging
- Price formatting with currency symbol
- Responsive Bootstrap styling
- Table hover effects

---

## Usage

### In Your Main App Component:

```typescript
import { Component } from '@angular/core';
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StockAnalysisComponent],
  template: `<app-stock-analysis></app-stock-analysis>`,
})
export class AppComponent {}
```

### Module Setup (if using modules):

```typescript
import { StockAnalysisComponent } from './components/stock-analysis/stock-analysis.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    StockAnalysisComponent
  ]
})
export class YourModule {}
```

---

## API Configuration

To modify API details, edit [stock.service.ts](stock.service.ts):

```typescript
private apiUrl = 'https://paisamastertamil.com/share/masterdata/getuser';
private authToken = 'ABCDEF';
private userId = 1234567890;
private requestTimeoutMs = 30000;
```

---

## Component Architecture

### Files Created:

1. **stock.model.ts** - TypeScript interface for Stock object
2. **stock.service.ts** - Service for API communication
3. **stock-analysis.component.ts** - Main component logic
4. **stock-analysis.component.html** - Template with new control flow syntax
5. **stock-analysis.component.css** - Comprehensive styling

---

## Styling Breakdown

### Row Color Classes:
- `.row-red` - Hover: `#f5c6cb`
- `.row-green` - Hover: `#c3e6cb`
- `.row-amber` - Hover: `#ffeeba`
- `.row-blue` - Hover: `#bee5eb`

All colors use lighter variants for accessibility (WCAG compliant).

---

## State Management Flow

```
ngOnInit()
    ↓
fetchStocks() [sets isLoading = true]
    ↓
StockService.getStocks()
    ↓
HTTP POST request
    ↓
Success → stocks signal updated, isLoading = false
   or
Failure → error signal set, isLoading = false
    ↓
Computed filteredStocks() reactive to both stocks and searchSymbol
    ↓
Template re-renders with new data
```

---

## Reactive Features

### Search Filter (Computed Signal):
```typescript
filteredStocks = computed(() => {
  const allStocks = this.stocks();
  const search = this.searchSymbol().toLowerCase();
  if (!search) return allStocks;
  return allStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(search)
  );
});
```

**Behavior:**
- Updates automatically when `stocks()` or `searchSymbol()` changes
- No manual subscription needed
- Efficient: only recalculates when dependencies change

---

## Performance Optimizations

1. **OnPush Change Detection** - Updates only when Signals change
2. **Track Function** - `@for (stock of filteredStocks(); track stock.id)`
3. **No Manual Subscriptions** - Signals eliminate subscription overhead
4. **Lazy Evaluation** - Computed signals only recalculate when needed

---

## Testing Guide

### Unit Test Example (for StockService):
```typescript
it('should fetch stocks with correct headers', () => {
  const mockStocks: Stock[] = [{ /* data */ }];
  spyOn(http, 'post').and.returnValue(of(mockStocks));
  
  service.getStocks().subscribe(stocks => {
    expect(stocks).toEqual(mockStocks);
  });
});
```

### Component Testing Example:
```typescript
it('should filter stocks by symbol', () => {
  component.stocks.set(mockStocks);
  component.searchSymbol.set('RAD');
  
  expect(component.filteredStocks()[0].symbol).toContain('RAD');
});
```

---

## Troubleshooting

**Issue:** Component not loading data
- Check Authorization Token is correct
- Verify API URL is accessible
- Check browser console for CORS errors

**Issue:** Search not working
- Ensure `[(ngModel)]` is properly bound
- Verify FormsModule is imported
- Check computed signal dependencies

**Issue:** Styling not applying
- Ensure Bootstrap CSS is imported in global styles
- Check for CSS specificity conflicts
- Verify dark mode compatibility if needed

---

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Angular 21+ required

---

## Dependencies

Required in your Angular project:
- `@angular/common` (CommonModule, FormsModule)
- `@angular/core` (Signals, ChangeDetectionStrategy)
- `@angular/platform-browser` (HttpClientModule)
- `bootstrap` (CSS framework for styling)

---

## Future Enhancements

- [ ] Add sorting by columns
- [ ] Implement pagination for large datasets
- [ ] Add export to CSV/Excel
- [ ] Implement favorites toggle
- [ ] Add advanced filtering by sector/price range
- [ ] Add real-time price updates (WebSocket)
- [ ] Dark mode support
