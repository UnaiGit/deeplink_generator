import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../shared/services/theme';
import {
  ChartComponent as ApexChartComponent,
  ApexChart,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { StackedBarChartOptions } from '@/types/analytics/stacked-bar-chart-options.type';

@Component({
  selector: 'app-food-status',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './food-status.html',
  styleUrl: './food-status.scss',
})
export class FoodStatus implements OnInit {
  @ViewChild('stackedBarChart') stackedBarChart!: ApexChartComponent;

  public stackedBarChartOptions: StackedBarChartOptions = {
    series: [],
    chart: { type: 'bar' } as ApexChart,
    xaxis: {} as ApexXAxis,
    yaxis: {} as ApexYAxis,
    grid: {} as ApexGrid,
    dataLabels: {} as ApexDataLabels,
    fill: {} as ApexFill,
    plotOptions: {} as ApexPlotOptions,
    colors: [],
  };

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.initializeStackedBarChart();

    this.translate.onLangChange.subscribe(() => {
      this.initializeStackedBarChart();
    });

    this.themeService.theme$.subscribe(() => {
      this.initializeStackedBarChart();
    });
  }

  private initializeStackedBarChart() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const isDarkMode = this.themeService.isDarkMode;
    const axisColor = isDarkMode ? '#9ca3af' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#F3F4F6';

    // Data matching the image: 
    // Stacking order (bottom to top): Fresh (Teal) -> Available (Grey) -> Expired (Red)
    // Bottom segment (Fresh/Teal): ~30 units (0-30)
    // Middle segment (Available/Grey): ~60 units (30-90)
    // Top segment (Expired/Red): ~30 units (90-120)
    this.stackedBarChartOptions = {
      series: [
        {
          name: 'Fresh',
          data: [30, 30, 30, 30, 30, 30, 30],
        },
        {
          name: 'Available',
          data: [60, 60, 60, 60, 60, 60, 60],
        },
        {
          name: 'Expired',
          data: [30, 30, 30, 30, 30, 30, 30],
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: ['#40C4AA', '#E5E7EB', '#DC3545'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 2,
          borderRadiusApplication: 'around',
          borderRadiusWhenStacked: 'all',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: days,
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
        type: 'gradient',
        gradient: {
          type: 'vertical',
          shadeIntensity: 1,
          opacityFrom: 0.8,
          opacityTo: 1,
          colorStops: [
            [
              {
                offset: 0,
                color: '#6EE7B7',
                opacity: 1,
              },
              {
                offset: 100,
                color: '#34D399',
                opacity: 1,
              },
            ],
            [
              {
                offset: 0,
                color: '#E0E0E0',
                opacity: 1,
              },
              {
                offset: 100,
                color: '#B0B0B0',
                opacity: 1,
              },
            ],
            [
              {
                offset: 0,
                color: '#FF6B6B',
                opacity: 1,
              },
              {
                offset: 100,
                color: '#E03B3B',
                opacity: 1,
              },
            ],
          ],
        },
      },
    };
  }
}

