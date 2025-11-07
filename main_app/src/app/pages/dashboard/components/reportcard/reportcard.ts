import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from './../../../../shared/services/theme';
import {
  ChartComponent as ApexChartComponent,
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexDataLabels,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  colors: string[];
};

interface ReportItem {
  id: number;
  description: string;
  category: string;
  categoryColor: string;
  categoryBgColor: string;
  thumbnail: string;
}

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

  reports: ReportItem[] = [
    {
      id: 1,
      description: 'Improve image of your dishes and make titles more striking',
      category: 'Marketing',
      categoryColor: '#28A745',
      categoryBgColor: '#E6F7ED',
      thumbnail: '/images/dasproduct.png',
    },
    {
      id: 2,
      description: 'Improve image of your dishes and make titles more striking',
      category: 'Finance',
      categoryColor: '#007BFF',
      categoryBgColor: '#E0F2F7',
      thumbnail: '/images/dasproduct.png',
    },
    {
      id: 3,
      description: 'Improve image of your dishes and make titles more striking',
      category: 'Feedback',
      categoryColor: '#FD7E14',
      categoryBgColor: '#FFF3E0',
      thumbnail: '/images/dasproduct.png',
    },
  ];

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.initializeBarChart();
    this.updateSelectedPeriod();
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

      const rectBlue = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectBlue.setAttribute('width', '6');
      rectBlue.setAttribute('height', '6');
      rectBlue.setAttribute('fill', '#4285F4');
      patternBlue.appendChild(rectBlue);

      const lineBlue = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineBlue.setAttribute('x1', '0');
      lineBlue.setAttribute('y1', '0');
      lineBlue.setAttribute('x2', '6');
      lineBlue.setAttribute('y2', '6');
      lineBlue.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
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

      const rectGrey = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectGrey.setAttribute('width', '6');
      rectGrey.setAttribute('height', '6');
      rectGrey.setAttribute('fill', '#E0E0E0');
      patternGrey.appendChild(rectGrey);

      const lineGrey = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineGrey.setAttribute('x1', '0');
      lineGrey.setAttribute('y1', '0');
      lineGrey.setAttribute('x2', '6');
      lineGrey.setAttribute('y2', '6');
      lineGrey.setAttribute('stroke', 'rgba(0, 0, 0, 0.08)');
      lineGrey.setAttribute('stroke-width', '0.5');
      patternGrey.appendChild(lineGrey);

      defs.appendChild(patternGrey);
    }

    // Update bar fills to use patterns - find all bar paths
    setTimeout(() => {
      const allBars = svg.querySelectorAll('.apexcharts-bar-series path');
      const activeIndex = 4; // Thursday (5th bar, 0-indexed)
      
      allBars.forEach((bar: any, index: number) => {
        const fillColor = bar.getAttribute('fill');
        if (fillColor === '#4285F4' || (index === activeIndex && fillColor)) {
          bar.setAttribute('fill', 'url(#diagonal-stripes-blue)');
        } else if (fillColor === '#E0E0E0' || fillColor) {
          bar.setAttribute('fill', 'url(#diagonal-stripes-grey)');
        }
      });
    }, 200);
  }

  private initializeBarChart() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [20, 32, 24, 44, 36, 28, 20];
    const activeIndex = 4; // Thursday

    const isDarkMode = this.themeService.isDarkMode;
    const axisColor = isDarkMode ? '#9ca3af' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#E0E0E0';

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
        index === activeIndex ? '#4285F4' : '#E0E0E0',
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
