import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioItem } from '../../models/portfolio.model';

interface SectorSummary {
  sector: string;
  totalCompanies: number;
  totalStocks: number;
  averageCurrentPrice: string;
  totalCurrentValue: string;
  allocatedPercent: number;
  color: string;
}

@Component({
  selector: 'app-sectorwise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sectorwise.component.html',
  styleUrls: ['../common-styles.css', './sectorwise.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectorwiseComponent implements OnInit {
  portfolio = signal<PortfolioItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  private readonly pieColors = ['#764ba2', '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2', '#fd7e14', '#20c997'];

  sectorSummaries = computed(() => {
    const items = this.portfolio();
    const sectorMap = new Map<string, { companies: number; stocks: number; currentValue: number; currentPriceTotal: number }>();

    items.forEach(item => {
      const sector = item.masterdata.sector || 'Unknown';
      const count = sectorMap.get(sector) ?? { companies: 0, stocks: 0, currentValue: 0, currentPriceTotal: 0 };
      const stockCount = Number(item.noofstocks) || 0;
      const currentPrice = Number(item.masterdata.currentprice) || 0;
      count.companies += 1;
      count.stocks += stockCount;
      count.currentValue += stockCount * currentPrice;
      count.currentPriceTotal += currentPrice;
      sectorMap.set(sector, count);
    });

    const totalPortfolioValue = Array.from(sectorMap.values()).reduce((sum, values) => sum + values.currentValue, 0);

    return Array.from(sectorMap.entries()).map(([sector, values], index) => ({
      sector,
      totalCompanies: values.companies,
      totalStocks: values.stocks,
      allocatedPercent: totalPortfolioValue ? (values.currentValue / totalPortfolioValue) * 100 : 0,
      averageCurrentPrice: values.companies ? `₹${(values.currentPriceTotal / values.companies).toFixed(2)}` : '-',
      totalCurrentValue: values.stocks ? `₹${values.currentValue.toFixed(2)}` : '-',
      color: this.pieColors[index % this.pieColors.length]
    })).sort((a, b) => a.sector.localeCompare(b.sector));
  });

  sectorPieSegments = computed(() => {
    const sectors = this.sectorSummaries();
    let startAngle = -90;

    return sectors.map((summary, index) => {
      const angle = summary.allocatedPercent * 360 / 100;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      const isFullCircle = angle >= 359.99;
      const largeArcFlag = angle > 180 ? 1 : 0;
      const radius = 80;
      const center = 140;
      const lineStartRadius = radius - 10;
      const lineEndRadius = radius + 20;
      const labelRadius = radius + 40;
      const startX = center + radius * Math.cos((Math.PI / 180) * startAngle);
      const startY = center + radius * Math.sin((Math.PI / 180) * startAngle);
      const endX = center + radius * Math.cos((Math.PI / 180) * endAngle);
      const endY = center + radius * Math.sin((Math.PI / 180) * endAngle);
      const lineStartX = center + lineStartRadius * Math.cos((Math.PI / 180) * midAngle);
      const lineStartY = center + lineStartRadius * Math.sin((Math.PI / 180) * midAngle);
      const lineEndX = center + lineEndRadius * Math.cos((Math.PI / 180) * midAngle);
      const lineEndY = center + lineEndRadius * Math.sin((Math.PI / 180) * midAngle);
      const labelX = center + labelRadius * Math.cos((Math.PI / 180) * midAngle);
      const labelY = center + labelRadius * Math.sin((Math.PI / 180) * midAngle);
      const textAnchor = Math.cos((Math.PI / 180) * midAngle) >= 0 ? 'start' : 'end';
      const path = isFullCircle
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`
        : `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

      startAngle = endAngle;

      return {
        sector: summary.sector,
        percent: summary.allocatedPercent,
        color: summary.color,
        path,
        lineStartX,
        lineStartY,
        lineEndX,
        lineEndY,
        labelX,
        labelY,
        textAnchor,
        labelText: `${summary.allocatedPercent.toFixed(1)}%`
      };
    }).filter(segment => segment.percent > 0);
  });

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadSectorData();
  }

  getAllocationClass(summary: SectorSummary): string {
    return summary.allocatedPercent > 16 ? 'row-red' : 'row-green';
  }

  private loadSectorData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.portfolioService.getPortfolio().subscribe({
      next: (data) => {
        this.portfolio.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading sectorwise data:', err);
        this.error.set('Failed to load sectorwise data. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}
