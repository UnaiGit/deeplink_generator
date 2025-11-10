import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexMarkers,
  ApexTooltip,
  ApexFill,
  ApexStroke,
} from 'ng-apexcharts';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  markers: ApexMarkers;
  tooltip: ApexTooltip;
  fill?: ApexFill;
  colors: string[];
  stroke: ApexStroke;
};

