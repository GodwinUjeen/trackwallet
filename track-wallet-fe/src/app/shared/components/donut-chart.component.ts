import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  template: `
    <div class="wrap">
      <canvas #canvas></canvas>
      <div class="center">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        position: relative;
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
        aspect-ratio: 1;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
      .center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        text-align: center;
        padding: 2rem;
      }
    `,
  ],
})
export class DonutChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() values: number[] = [];
  @Input() colors: string[] = [];
  private chart?: Chart;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['values'] || changes['colors']) && this.chart) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.canvasRef) return;
    const data = this.values.length ? this.values : [1];
    const bg = this.values.length ? this.colors : ['#333'];
    if (this.chart) {
      this.chart.data.datasets[0].data = data;
      this.chart.data.datasets[0].backgroundColor = bg;
      this.chart.update();
      return;
    }
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data,
            backgroundColor: bg,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: true,
      },
    });
  }
}
