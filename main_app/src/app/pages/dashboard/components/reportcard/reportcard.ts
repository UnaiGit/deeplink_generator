import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from './../../../../shared/services/theme';
import {
  ChartComponent as ApexChartComponent,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexDataLabels,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { BarChartOptions } from '@/types/dashboard/bar-chart-options.type';
import { ReportItem } from '@/types/interfaces/dashboard/report-item.interface';

@Component({
  selector: 'app-reportcard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './reportcard.html',
  styleUrl: './reportcard.scss',
})
export class Reportcard implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChart!: ApexChartComponent;
  @ViewChild('chartContainer', { read: ElementRef }) chartContainer!: ElementRef;

  public barChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar' } as ApexChart,
    xaxis: {} as ApexXAxis,
    yaxis: {} as ApexYAxis,
    grid: {} as ApexGrid,
    plotOptions: {} as ApexPlotOptions,
    fill: {} as ApexFill,
    dataLabels: {} as ApexDataLabels,
    colors: [],
  };

  selectedPeriod: string = 'Daily';

  reports: ReportItem[] = [];

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
  ) {}

  /**
   * Get CSS variable value with fallback
   */
  private getCssVariable(variable: string, fallback: string = ''): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }

  ngOnInit() {
    this.initializeBarChart();
    this.updateSelectedPeriod();
    this.updateReportColors();
  }

  private updateReportColors() {
    // Update report colors with CSS variables
    this.reports = [
    {
      id: 1,
      description: 'Improve image of your dishes and make titles more striking',
      category: 'Marketing',
        categoryColor: this.getCssVariable('--success-green-alt', '#28A745'),
        categoryBgColor: this.getCssVariable('--success-bg-light', '#E6F7ED'),
      thumbnail: '/images/dasproduct.png',
    },
    {
      id: 2,
      description: 'Improve image of your dishes and make titles more striking',
      category: 'Finance',
        categoryColor: this.getCssVariable('--google-blue', '#007BFF'),
        categoryBgColor: this.getCssVariable('--sky-blue-light-bg', '#E0F2F7'),
      thumbnail: '/images/dasproduct.png',
    },
    {
      id: 3,
      description: 'Improve image of your dishes and make titles more striking',
      category: 'Feedback',
        categoryColor: this.getCssVariable('--orange', '#FD7E14'),
        categoryBgColor: this.getCssVariable('--orange-light-bg', '#FFF3E0'),
      thumbnail: '/images/dasproduct.png',
    },
  ];
  }

  ngAfterViewInit() {
    // Add SVG patterns for diagonal stripes after chart is rendered
    setTimeout(() => {
      this.addDiagonalStripes();
    }, 500);
  }

  private addDiagonalStripes() {
    if (!this.chartContainer?.nativeElement) return;

    const svg = this.chartContainer.nativeElement.querySelector('svg');
    if (!svg) return;

    // Check if defs already exists
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    // Add blue diagonal stripe pattern
    if (!defs.querySelector('#diagonal-stripes-blue')) {
      const patternBlue = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      patternBlue.setAttribute('id', 'diagonal-stripes-blue');
      patternBlue.setAttribute('width', '6');
      patternBlue.setAttribute('height', '6');
      patternBlue.setAttribute('patternUnits', 'userSpaceOnUse');
      patternBlue.setAttribute('patternTransform', 'rotate(45)');

      const blueColor = this.getCssVariable('--google-blue', '#4285F4');
      // Use white overlay with 0.2 opacity for the line
      const whiteOverlay20 = 'rgba(255, 255, 255, 0.2)';

      const rectBlue = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectBlue.setAttribute('width', '6');
      rectBlue.setAttribute('height', '6');
      rectBlue.setAttribute('fill', blueColor);
      patternBlue.appendChild(rectBlue);

      const lineBlue = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineBlue.setAttribute('x1', '0');
      lineBlue.setAttribute('y1', '0');
      lineBlue.setAttribute('x2', '6');
      lineBlue.setAttribute('y2', '6');
      lineBlue.setAttribute('stroke', whiteOverlay20);
      lineBlue.setAttribute('stroke-width', '0.5');
      patternBlue.appendChild(lineBlue);

      defs.appendChild(patternBlue);
    }

    // Add grey diagonal stripe pattern
    if (!defs.querySelector('#diagonal-stripes-grey')) {
      const patternGrey = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      patternGrey.setAttribute('id', 'diagonal-stripes-grey');
      patternGrey.setAttribute('width', '6');
      patternGrey.setAttribute('height', '6');
      patternGrey.setAttribute('patternUnits', 'userSpaceOnUse');
      patternGrey.setAttribute('patternTransform', 'rotate(45)');

      const grayColor = this.getCssVariable('--border-light-gray', '#E0E0E0');
      // Use overlay with 0.08 opacity for the line
      const overlayVeryLight08 = 'rgba(0, 0, 0, 0.08)';

      const rectGrey = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectGrey.setAttribute('width', '6');
      rectGrey.setAttribute('height', '6');
      rectGrey.setAttribute('fill', grayColor);
      patternGrey.appendChild(rectGrey);

      const lineGrey = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineGrey.setAttribute('x1', '0');
      lineGrey.setAttribute('y1', '0');
      lineGrey.setAttribute('x2', '6');
      lineGrey.setAttribute('y2', '6');
      lineGrey.setAttribute('stroke', overlayVeryLight08);
      lineGrey.setAttribute('stroke-width', '0.5');
      patternGrey.appendChild(lineGrey);

      defs.appendChild(patternGrey);
    }

    // Update bar fills to use patterns - find all bar paths
    setTimeout(() => {
      const allBars = svg.querySelectorAll('.apexcharts-bar-series path');
      const activeIndex = 4; // Thursday (5th bar, 0-indexed)
      
      const blueColor = this.getCssVariable('--google-blue', '#4285F4');
      const grayColor = this.getCssVariable('--border-light-gray', '#E0E0E0');
      
      allBars.forEach((bar: any, index: number) => {
        const fillColor = bar.getAttribute('fill');
        if (fillColor === blueColor || (index === activeIndex && fillColor)) {
          bar.setAttribute('fill', 'url(#diagonal-stripes-blue)');
        } else if (fillColor === grayColor || fillColor) {
          bar.setAttribute('fill', 'url(#diagonal-stripes-grey)');
        }
      });
    }, 200);
  }

  private initializeBarChart() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [20, 32, 24, 44, 36, 28, 20];
    const activeIndex = 4; // Thursday

    const axisColor = this.getCssVariable('--text-color-medium-alt', '#6B7280');
    const gridColor = this.getCssVariable('--border-light-gray', '#E0E0E0');
    const blueColor = this.getCssVariable('--google-blue', '#4285F4');
    const grayColor = this.getCssVariable('--border-light-gray', '#E0E0E0');

    this.barChartOptions = {
      series: [
        {
          name: 'Customer Density',
          data: data,
        },
      ],
      chart: {
        type: 'bar',
        height: 280,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          speed: 800,
        },
      },
      colors: data.map((_, index) =>
        index === activeIndex ? blueColor : grayColor,
      ),
      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: 'end',
          columnWidth: '60%',
          distributed: true,
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
            fontWeight: 400,
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontFamily: 'Manrope',
            fontSize: '12px',
            colors: axisColor,
            fontWeight: 400,
          },
          formatter: (value: number) => {
            return value.toString();
          },
        },
        tickAmount: 4,
        min: 0,
        max: 60,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
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

  updateSelectedPeriod() {
    this.selectedPeriod = this.translate.instant('Daily');
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    // Here you could update the chart data based on the selected period
  }
}
