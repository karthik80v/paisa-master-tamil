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

  private readonly pieColors = [
    '#764ba2', '#0d6efd', '#198754', '#ffc107', 
    '#0dcaf0', '#e83e8c', '#17a2b8', '#BE61CA',
    '#ff6b6b', '#EFAAC1', '#6610f2', '#dc3545', 
    '#FF6B6B', '#4ECDC4', '#fd7e14', '#20c997',
    '#FDCB6E', '#6C5CE7', '#00B894', '#E17055'
  ];

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
      const outerRadius = 80;
      const innerRadius = 45;
      const center = 140;
      const lineStartRadius = outerRadius + 5;
      const lineEndRadius = outerRadius + 20;
      const labelRadius = outerRadius + 25;
      
      // Outer arc points
      const outerStartX = center + outerRadius * Math.cos((Math.PI / 180) * startAngle);
      const outerStartY = center + outerRadius * Math.sin((Math.PI / 180) * startAngle);
      const outerEndX = center + outerRadius * Math.cos((Math.PI / 180) * endAngle);
      const outerEndY = center + outerRadius * Math.sin((Math.PI / 180) * endAngle);
      
      // Inner arc points
      const innerStartX = center + innerRadius * Math.cos((Math.PI / 180) * startAngle);
      const innerStartY = center + innerRadius * Math.sin((Math.PI / 180) * startAngle);
      const innerEndX = center + innerRadius * Math.cos((Math.PI / 180) * endAngle);
      const innerEndY = center + innerRadius * Math.sin((Math.PI / 180) * endAngle);
      
      const lineStartX = center + lineStartRadius * Math.cos((Math.PI / 180) * midAngle);
      const lineStartY = center + lineStartRadius * Math.sin((Math.PI / 180) * midAngle);
      const lineEndX = center + lineEndRadius * Math.cos((Math.PI / 180) * midAngle);
      const lineEndY = center + lineEndRadius * Math.sin((Math.PI / 180) * midAngle);
      const labelX = center + labelRadius * Math.cos((Math.PI / 180) * midAngle);
      const labelY = center + labelRadius * Math.sin((Math.PI / 180) * midAngle);
      const textAnchor = Math.cos((Math.PI / 180) * midAngle) >= 0 ? 'start' : 'end';
      
      // Create doughnut path
      const path = isFullCircle
        ? `M ${center} ${center - outerRadius} A ${outerRadius} ${outerRadius} 0 1 1 ${center - 0.01} ${center - outerRadius} L ${center - 0.01} ${center - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
        : `M ${outerStartX} ${outerStartY} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} Z`;

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
