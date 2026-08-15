import { Component, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SideNavComponent } from '../../shared/components/side-nav.component';
import { LineChartComponent, LineSeries } from '../../shared/components/line-chart.component';
import { MonthNavComponent } from '../../shared/components/month-nav.component';
import { SegmentedComponent } from '../../shared/components/segmented.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Averages, CompareData, Summary, TimeseriesPoint } from '../../core/models';
import { monthLabel, shiftMonth } from '../../shared/utils/format';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    SideNavComponent,
    LineChartComponent,
    MonthNavComponent,
    SegmentedComponent,
    InrPipe,
  ],
  template: `
    <app-side-nav />
    <div class="page">
      <header class="page-header">
        <h1>Analytics</h1>
        <app-month-nav
          [month]="month()"
          [year]="year()"
          (prev)="changeMonth(-1)"
          (next)="changeMonth(1)"
        />
      </header>

      <div class="page-body">
      <section class="card chart-card">
        <div class="toggles">
          <app-segmented
            [compact]="true"
            [options]="toggleOpts"
            [value]="toggle()"
            (valueChange)="onToggle($event)"
          />
          <span class="muted pill">~ Day</span>
        </div>
        <app-line-chart [labels]="labels()" [series]="chartSeries()" />
      </section>

      <div class="stats-grid">
        <section class="card">
          <div class="card-title">Cash flow · {{ label() }}</div>
          <div class="flow-row">
            <span class="material-symbols-outlined income">arrow_upward</span>
            <span>Income</span>
            <span class="income amount">{{ summary().income | inr }}</span>
          </div>
          <div class="flow-row">
            <span class="material-symbols-outlined expense">arrow_downward</span>
            <span>Expenses</span>
            <span class="expense amount">{{ summary().expense | inr }}</span>
          </div>
          <div class="flow-row total">
            <span>Total</span>
            <span [class.income]="summary().net >= 0" [class.expense]="summary().net < 0">
              {{ summary().net | inr: { signed: true } }}
            </span>
          </div>
        </section>

        <section class="card">
          <div class="card-title">Average · {{ label() }}</div>
          <div class="avg-grid">
            <div></div>
            <div class="muted">Income</div>
            <div class="muted">Expense</div>
            <div class="muted">Day</div>
            <div class="income">{{ averages().day.income | inr }}</div>
            <div class="expense">{{ averages().day.expense | inr }}</div>
            <div class="muted">Week</div>
            <div class="income">{{ averages().week.income | inr }}</div>
            <div class="expense">{{ averages().week.expense | inr }}</div>
            <div class="muted">Month</div>
            <div class="income">{{ averages().month.income | inr }}</div>
            <div class="expense">{{ averages().month.expense | inr }}</div>
          </div>
        </section>

        <section class="card">
          <div class="card-title">
            Compare · vs {{ compare().previous.month }}/{{ compare().previous.year }}
          </div>
          <div class="cmp">
            <div class="muted">Cash flow (prev)</div>
            <div class="income">{{ compare().previous.income | inr }}</div>
            <div class="expense">{{ compare().previous.expense | inr }}</div>
            <div class="muted">Change</div>
            <div
              [class.income]="compare().change.income.amount >= 0"
              [class.expense]="compare().change.income.amount < 0"
            >
              {{ compare().change.income.amount | inr: { signed: true } }}
            </div>
            <div
              [class.income]="compare().change.expense.amount >= 0"
              [class.expense]="compare().change.expense.amount < 0"
            >
              {{ compare().change.expense.amount | inr: { signed: true } }}
            </div>
            <div class="muted">Percent</div>
            <div>{{ compare().change.income.percent }}%</div>
            <div>{{ compare().change.expense.percent }}%</div>
          </div>
        </section>
      </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        flex-wrap: wrap;
      }
      .chart-card {
        margin-bottom: 1rem;
      }
      .toggles {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }
      .pill {
        font-size: 0.8rem;
        background: var(--badge-bg);
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }
      .flow-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0;
      }
      .amount {
        margin-left: auto;
        font-weight: 600;
      }
      .total {
        border-top: 1px solid var(--border);
        margin-top: 0.35rem;
        padding-top: 0.65rem;
        font-weight: 600;
      }
      .total span:last-child {
        margin-left: auto;
      }
      .avg-grid,
      .cmp {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.65rem;
        font-size: 0.9rem;
      }
      @media (max-width: 1100px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AnalyticsComponent implements OnInit {
  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());
  label = signal('');
  summary = signal<Summary>({ income: 0, expense: 0, net: 0 });
  averages = signal<Averages>({
    day: { income: 0, expense: 0 },
    week: { income: 0, expense: 0 },
    month: { income: 0, expense: 0 },
  });
  compare = signal<CompareData>({
    current: { income: 0, expense: 0, net: 0 },
    previous: { income: 0, expense: 0, net: 0, year: 0, month: 0 },
    change: {
      income: { amount: 0, percent: 0 },
      expense: { amount: 0, percent: 0 },
    },
  });
  labels = signal<string[]>([]);
  points = signal<TimeseriesPoint[]>([]);
  chartSeries = signal<LineSeries[]>([]);
  toggle = signal('both');
  toggleOpts = [
    { label: 'Income', value: 'income' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Total', value: 'total' },
    { label: 'Both', value: 'both' },
  ];

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.load();
  }

  changeMonth(delta: number): void {
    const next = shiftMonth(this.month(), this.year(), delta);
    this.month.set(next.month);
    this.year.set(next.year);
    this.load();
  }

  onToggle(v: string): void {
    this.toggle.set(v);
    this.applySeries();
  }

  load(): void {
    const m = this.month();
    const y = this.year();
    this.label.set(monthLabel(m, y));
    forkJoin({
      summary: this.analytics.summary(m, y),
      averages: this.analytics.averages(m, y),
      compare: this.analytics.compare(m, y),
      series: this.analytics.timeseries(m, y),
    }).subscribe(({ summary, averages, compare, series }) => {
      this.summary.set(summary);
      this.averages.set(averages);
      this.compare.set(compare);
      this.points.set(series);
      this.labels.set(
        series.map((s, i) =>
          i === 0 || i === series.length - 1 || i % 10 === 0 ? s.date.slice(5) : ''
        )
      );
      this.applySeries();
    });
  }

  private applySeries(): void {
    const pts = this.points();
    const t = this.toggle();
    const series: LineSeries[] = [];
    if (t === 'income' || t === 'both') {
      series.push({ label: 'Income', data: pts.map((p) => p.income), color: '#66BB6A' });
    }
    if (t === 'expense' || t === 'both') {
      series.push({ label: 'Expenses', data: pts.map((p) => p.expense), color: '#EF5350' });
    }
    if (t === 'total') {
      series.push({ label: 'Total', data: pts.map((p) => p.total), color: '#64B5F6' });
    }
    this.chartSeries.set(series);
  }
}
