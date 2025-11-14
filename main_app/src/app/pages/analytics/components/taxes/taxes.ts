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
  selector: 'app-taxes',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './taxes.html',
  styleUrl: './taxes.scss',
})
export class Taxes implements OnInit {
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

  selectedPeriod: string = 'Weekly';
  benefit: string = '$2.450';
  tribute: string = '$150';

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.initializeLineChart();

    this.translate.onLangChange.subscribe(() => {
      this.initializeLineChart();
    });

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
    const successGreen = this.getCssVariable('--success-green', '#2ecc71');
    const red = this.getCssVariable('--red', '#dc3545');
    const primaryBlue = this.getCssVariable('--primary-blue', '#2D71F7');
    const white = this.getCssVariable('--white', '#FFFFFF');

    // Benefit data (green line) and Tribute data (red line)
    const benefitData = [60, 70, 65, 80, 120, 90];
    const tributeData = [20, 25, 22, 30, 35, 28];

    this.lineChartOptions = {
      series: [
        {
          name: 'Benefit',
          data: benefitData,
        },
        {
          name: 'Tribute',
          data: tributeData,
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
      colors: [successGreen, red],
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
                color: successGreen,
                opacity: 1,
              },
              {
                offset: 90.95,
                color: successGreen,
                opacity: 0.1,
              },
              {
                offset: 103.37,
                color: white,
                opacity: 0.4,
              },
            ],
            [
              {
                offset: 0,
                color: red,
                opacity: 1,
              },
              {
                offset: 90.95,
                color: red,
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
          const isMay = dataPointIndex === 4 && seriesIndex === 0; // May Benefit

          // Scale the value to match the display
          const displayValue = isMay ? 1200 : value * 10;

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
  }
}

