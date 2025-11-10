import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../shared/services/theme';
import {
  ChartComponent as ApexChartComponent,
  ApexChart,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { BarChartOptions } from '@/types/analytics/bar-chart-options.type';

@Component({
  selector: 'app-benefits-category',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './benefits-category.html',
  styleUrl: './benefits-category.scss',
})
export class BenefitsCategory implements OnInit {
  @ViewChild('barChart') barChart!: ApexChartComponent;

  public barChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar' } as ApexChart,
    xaxis: {} as ApexXAxis,
    yaxis: {} as ApexYAxis,
    grid: {} as ApexGrid,
    plotOptions: {} as ApexPlotOptions,
    dataLabels: {} as ApexDataLabels,
    fill: {} as ApexFill,
    colors: [],
  };

  selectedPeriod: string = 'Monthly';

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.initializeBarChart();

    this.translate.onLangChange.subscribe(() => {
      this.initializeBarChart();
    });

    this.themeService.theme$.subscribe(() => {
      this.initializeBarChart();
    });
  }

  private initializeBarChart() {
    const categories = [
      this.translate.instant('Starters'),
      'Fish',
      'Meats',
      'Pasta',
      this.translate.instant('Desserts'),
      'Wines',
      'Drinks',
    ];

    const isDarkMode = this.themeService.isDarkMode;
    const axisColor = isDarkMode ? '#9ca3af' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#F3F4F6';

    // Benefits data for each category
    const benefitsData = [60, 80, 70, 90, 110, 85, 75];

    this.barChartOptions = {
      series: [
        {
          name: 'Benefits',
          data: benefitsData,
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: {
          show: false,
        },
      },
      colors: ['#E5E7EB', '#E5E7EB', '#E5E7EB', '#E5E7EB', '#2D71F7', '#E5E7EB', '#E5E7EB'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: categories,
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
        tickAmount: 6,
        min: 0,
        max: 120,
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
        opacity: 1,
      },
    };
  }

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
  }
}

