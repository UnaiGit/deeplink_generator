import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../shared/services/theme';
import {
  ChartComponent as ApexChartComponent,
  ApexChart,
  ApexMarkers,
  ApexFill,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { LineChartOptions } from '@/types/analytics/line-chart-options.type';

@Component({
  selector: 'app-gensales',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './gensales.html',
  styleUrl: './gensales.scss',
})
export class Gensales implements OnInit {
  @ViewChild('lineChart') lineChart!: ApexChartComponent;

  public lineChartOptions: LineChartOptions = {
    series: [],
    chart: { type: 'line' } as ApexChart,
    xaxis: {} as ApexXAxis,
    yaxis: {} as ApexYAxis,
    grid: {} as ApexGrid,
    markers: {} as ApexMarkers,
    tooltip: {} as ApexTooltip,
    fill: {} as ApexFill,
    colors: [],
    stroke: {} as ApexStroke,
  };

  selectedPeriod: string = 'Daily';
  totalSales: string = '$2.450';
  averageSale: string = '$150';

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.initializeLineChart();

    // Update chart when language changes
    this.translate.onLangChange.subscribe(() => {
      this.initializeLineChart();
    });

    // Update chart when theme changes
    this.themeService.theme$.subscribe(() => {
      this.initializeLineChart();
    });
  }

  /**
   * Get CSS variable value with fallback
   */
  private getCssVariable(variable: string, fallback: string = ''): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }

  private initializeLineChart() {
    const months = [
      this.translate.instant('Jan'),
      this.translate.instant('Feb'),
      this.translate.instant('Mar'),
      this.translate.instant('Apr'),
      this.translate.instant('May'),
      this.translate.instant('Jun'),
    ];

    const axisColor = this.getCssVariable('--text-color-medium-alt', '#6B7280');
    const gridColor = this.getCssVariable('--gray-100', '#F3F4F6');
    const primaryBlue = this.getCssVariable('--primary-blue', '#2D71F7');
    const white = this.getCssVariable('--white', '#FFFFFF');

    // Sales data matching the image: ~45 Jan, ~60 Feb, ~35 Mar, ~70 Apr, ~55 May, ~70 Jun
    const salesData = [45, 60, 35, 70, 55, 70];

    this.lineChartOptions = {
      series: [
        {
          name: 'Sales',
          data: salesData,
        },
      ],
      chart: {
        type: 'line',
        height: 250,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: [primaryBlue],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
        },
        discrete: [
          {
            seriesIndex: 0,
            dataPointIndex: 4, // May
            fillColor: primaryBlue,
            strokeColor: white,
            size: 6,
          },
        ],
      },
      xaxis: {
        categories: months,
        labels: {
          style: {
            fontFamily: 'Manrope',
            fontSize: '12px',
            colors: axisColor,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontFamily: 'Manrope',
            fontSize: '12px',
            colors: axisColor,
          },
          formatter: (value: number) => {
            return value.toString();
          },
        },
        tickAmount: 5,
        min: 0,
        max: 100,
        forceNiceScale: false,
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          type: 'vertical',
          shadeIntensity: 1,
          opacityFrom: 1,
          opacityTo: 0.1,
          stops: [0, 90.95, 103.37],
          colorStops: [
            [
              {
                offset: 0,
                color: primaryBlue,
                opacity: 1,
              },
              {
                offset: 90.95,
                color: primaryBlue,
                opacity: 0.1,
              },
              {
                offset: 103.37,
                color: white,
                opacity: 0.4,
              },
            ],
          ],
        },
      },
      tooltip: {
        shared: false,
        intersect: false,
        custom: (options: any) => {
          const seriesIndex = options.seriesIndex;
          const dataPointIndex = options.dataPointIndex;
          const value = options.series[seriesIndex][dataPointIndex];
          const month = options.w.globals.categoryLabels[dataPointIndex];
          const year = '2024';
          const isMay = dataPointIndex === 4; // May is index 4

          // Scale the value to match the display - May shows $1.200
          const displayValue = isMay ? 1200 : Math.round(value * 17.14); // Scale to match other months

          return `
            <div class="custom-tooltip">
              <div class="tooltip-value">$${displayValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div class="tooltip-date">${month} ${year}</div>
              ${isMay ? '<div class="tooltip-change"><span class="arrow">↑</span>+12%</div>' : ''}
            </div>
          `;
        },
      },
    };
  }

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    // You can update chart data here based on selected period
  }
}
