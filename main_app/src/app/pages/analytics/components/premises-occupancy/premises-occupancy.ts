import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../shared/services/theme';
import {
  ChartComponent as ApexChartComponent,
  ApexChart,
  ApexMarkers,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { LineChartOptions } from '@/types/analytics/line-chart-options.type';

@Component({
  selector: 'app-premises-occupancy',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './premises-occupancy.html',
  styleUrl: './premises-occupancy.scss',
})
export class PremisesOccupancy implements OnInit {
  @ViewChild('lineChart') lineChart!: ApexChartComponent;

  public lineChartOptions: LineChartOptions = {
    series: [],
    chart: { type: 'line' } as ApexChart,
    xaxis: {} as ApexXAxis,
    yaxis: {} as ApexYAxis,
    grid: {} as ApexGrid,
    markers: {} as ApexMarkers,
    tooltip: {} as ApexTooltip,
    colors: [],
    stroke: {} as ApexStroke,
  };

  selectedPeriod: string = 'Monthly';

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

  private initializeLineChart() {
    const months = [
      this.translate.instant('Jan'),
      this.translate.instant('Feb'),
      this.translate.instant('Mar'),
      this.translate.instant('Apr'),
      this.translate.instant('May'),
      this.translate.instant('Jun'),
      this.translate.instant('Jul'),
    ];

    const isDarkMode = this.themeService.isDarkMode;
    const axisColor = isDarkMode ? '#9ca3af' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#F3F4F6';

    this.lineChartOptions = {
      series: [
        {
          name: 'Clients',
          data: [60, 70, 65, 80, 75, 85, 90],
        },
        {
          name: 'Reservations',
          data: [40, 50, 45, 55, 50, 60, 65],
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
      colors: ['#40C4AA', '#FFBE4C'],
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
      tooltip: {
        shared: false,
        intersect: false,
      },
    };
  }

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
  }
}

