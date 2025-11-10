import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from './../../../../shared/services/theme';
import {
  ChartComponent as ApexChartComponent,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexMarkers,
  ApexTooltip,
  ApexFill,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { DonutChartOptions } from '@/types/dashboard/donut-chart-options.type';
import { LineChartOptions } from '@/types/dashboard/line-chart-options.type';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart implements OnInit {
  @ViewChild('donutChart') donutChart!: ApexChartComponent;
  @ViewChild('lineChart') lineChart!: ApexChartComponent;

  public donutChartOptions: DonutChartOptions = {
    series: [],
    chart: { type: 'donut' } as ApexChart,
    responsive: [],
    labels: [],
    colors: [],
    legend: {} as ApexLegend,
    dataLabels: { enabled: false } as ApexDataLabels,
    stroke: { show: false } as ApexStroke,
    plotOptions: { pie: { donut: { size: '0%' } } } as ApexPlotOptions,
  };
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

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.initializeDonutChart();
    this.initializeLineChart();
    this.updateSelectedPeriod();

    // Update charts when language changes
    this.translate.onLangChange.subscribe(() => {
      this.initializeDonutChart();
      this.initializeLineChart();
      this.updateSelectedPeriod();
    });

    // Update charts when theme changes
    this.themeService.theme$.subscribe(() => {
      this.initializeDonutChart();
      this.initializeLineChart();
    });
  }

  private updateSelectedPeriod() {
    this.selectedPeriod = this.translate.instant('Daily');
  }

  private initializeDonutChart() {
    const labels = [this.translate.instant('Starters'), this.translate.instant('First course'), this.translate.instant('Desserts')];

    const isDarkMode = this.themeService.isDarkMode;
    const textColor = isDarkMode ? '#f3f4f6' : '#333333';

    this.donutChartOptions = {
      series: [8, 6, 3],
      chart: {
        type: 'donut',
        width: '100%',
        height: 250,
        toolbar: {
          show: false,
        },
      },
      labels: labels,
      colors: ['#2D71F7', '#40C4AA', '#81AAFA'],
      legend: {
        position: 'right',
        fontSize: '16px',
        fontFamily: 'Manrope, sans-serif',
        fontWeight: 500,
        offsetY: 0,
        offsetX: 0,
        labels: {
          colors: textColor,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 10,
        },
        formatter: (seriesName: string, opts: any) => {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `<div class="legend-item-wrapper">
                    <span class="legend-label">${seriesName}</span>
                    <span class="legend-value">${value}</span>
                  </div>`;
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              width: '100%',
              height: 300,
            },
            legend: {
              position: 'bottom',
              fontSize: '14px',
              itemMargin: {
                horizontal: 8,
                vertical: 8,
              },
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%',
              height: 280,
            },
            legend: {
              position: 'bottom',
              fontSize: '12px',
              itemMargin: {
                horizontal: 6,
                vertical: 6,
              },
            },
          },
        },
      ],
    };
  }

  private initializeLineChart() {
    const months = [
      this.translate.instant('Jan'),
      this.translate.instant('Feb'),
      this.translate.instant('Mar'),
      this.translate.instant('Apr'),
      this.translate.instant('May'),
      this.translate.instant('Jun'),
      this.translate.instant('Jul'),
      this.translate.instant('Aug'),
      this.translate.instant('Sep'),
      this.translate.instant('Oct'),
      this.translate.instant('Nov'),
      this.translate.instant('Dec'),
    ];

    const isDarkMode = this.themeService.isDarkMode;
    const axisColor = isDarkMode ? '#9ca3af' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#F3F4F6';

    this.lineChartOptions = {
      series: [
        {
          name: this.translate.instant('Earnings'),
          data: [20, 40, 35, 50, 45, 60, 120, 70, 65, 80, 75, 100],
        },
        {
          name: this.translate.instant('Bills'),
          data: [10, 15, 12, 18, 16, 20, 18, 22, 20, 25, 23, 15],
        },
      ],
      chart: {
        type: 'line',
        height: 300,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#2D71F7', '#FFBE4C'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
        },
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
                color: '#2D71F7',
                opacity: 1,
              },
              {
                offset: 90.95,
                color: '#2D71F7',
                opacity: 0.1,
              },
              {
                offset: 103.37,
                color: '#FFFFFF',
                opacity: 0.4,
              },
            ],
            [
              {
                offset: 0,
                color: '#FFBE4C',
                opacity: 1,
              },
              {
                offset: 90.95,
                color: '#FFBE4C',
                opacity: 0.1,
              },
              {
                offset: 103.37,
                color: '#FFFFFF',
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
          const isPositive = seriesIndex === 0 && dataPointIndex === 6;

          // Scale the value to match the display (multiply by 10 to get thousands)
          const displayValue = value * 10;

          return `
            <div class="custom-tooltip">
              <div class="tooltip-value">$${displayValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div class="tooltip-date">${month} ${year}</div>
              ${isPositive ? '<div class="tooltip-change"><span class="arrow">↑</span>+12%</div>' : ''}
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
