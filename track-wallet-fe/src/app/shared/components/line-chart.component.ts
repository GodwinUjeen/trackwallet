import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { ThemeService } from '../../core/services/theme.service';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

export interface LineSeries {
  label: string;
  data: number[];
  color: string;
  hidden?: boolean;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `<div class="wrap"><canvas #canvas></canvas></div>`,
  styles: [
    `
      .wrap {
        width: 100%;
        height: 280px;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() labels: string[] = [];
  @Input() series: LineSeries[] = [];
  private chart?: Chart;
  private readonly theme = inject(ThemeService);
  private ready = false;

  constructor() {
    effect(() => {
      this.theme.theme();
      if (this.ready) this.render();
    });
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.render();
  }

  ngOnChanges(_c: SimpleChanges): void {
    if (this.chart) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private themeColors(): { grid: string; tick: string } {
    const styles = getComputedStyle(document.documentElement);
    return {
      grid: styles.getPropertyValue('--border').trim() || '#2a2a2a',
      tick: styles.getPropertyValue('--muted').trim() || '#9e9e9e',
    };
  }

  private render(): void {
    if (!this.canvasRef) return;
    const { grid, tick } = this.themeColors();
    const datasets = this.series.map((s) => ({
      label: s.label,
      data: s.data,
      borderColor: s.color,
      backgroundColor: s.color + '33',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
      hidden: !!s.hidden,
      fill: false,
    }));

    if (this.chart) {
      this.chart.data.labels = this.labels;
      this.chart.data.datasets = datasets as never;
      const scales = this.chart.options.scales;
      if (scales?.['x']) {
        const x = scales['x'] as { grid?: { color?: string }; ticks?: { color?: string } };
        if (x.grid) x.grid.color = grid;
        if (x.ticks) x.ticks.color = tick;
      }
      if (scales?.['y']) {
        const y = scales['y'] as { grid?: { color?: string }; ticks?: { color?: string } };
        if (y.grid) y.grid.color = grid;
        if (y.ticks) y.ticks.color = tick;
      }
      this.chart.update();
      return;
    }

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: { labels: this.labels, datasets: datasets as never },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            grid: { color: grid },
            ticks: { color: tick, maxTicksLimit: 5 },
          },
          y: {
            grid: { color: grid },
            ticks: {
              color: tick,
              callback: (v) => {
                const n = Number(v);
                if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k₹`;
                return `${n}₹`;
              },
            },
          },
        },
      },
    });
  }
}
