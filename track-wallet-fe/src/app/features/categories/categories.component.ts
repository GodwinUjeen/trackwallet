import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SideNavComponent } from '../../shared/components/side-nav.component';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { DonutChartComponent } from '../../shared/components/donut-chart.component';
import { MonthNavComponent } from '../../shared/components/month-nav.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CategoryBreakdown, Summary } from '../../core/models';
import { shiftMonth } from '../../shared/utils/format';
import { FiltersComponent } from '../filters/filters.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    SideNavComponent,
    CategoryIconComponent,
    DonutChartComponent,
    MonthNavComponent,
    ModalComponent,
    InrPipe,
    RouterLink,
    FiltersComponent,
  ],
  template: `
    <app-side-nav />
    <div class="page">
      <header class="page-header">
        <h1>Categories</h1>
        <a routerLink="/categories/edit" class="btn-ghost">
          <span class="material-symbols-outlined">edit</span>
          Edit
        </a>
      </header>

      <div class="page-body">
      <div class="toolbar">
        <app-month-nav
          [month]="month()"
          [year]="year()"
          [showFilter]="true"
          (prev)="changeMonth(-1)"
          (next)="changeMonth(1)"
          (filter)="openFilters()"
        />
      </div>

      <div class="layout">
        <section class="card chart-card">
          <app-donut-chart [values]="donutValues()" [colors]="donutColors()">
            <div class="expense">{{ summary().expense | inr }}</div>
            <div class="income" style="font-size:0.85rem;margin-top:0.25rem">
              {{ summary().income | inr }}
            </div>
          </app-donut-chart>
        </section>

        <section class="card list-card">
          <div class="card-title">Breakdown</div>
          @for (c of breakdown().categories; track c.categoryId) {
            <div class="row">
              <app-category-icon [icon]="c.icon" [color]="c.color" [size]="40" />
              <div class="mid">
                <div class="name">{{ c.name }}</div>
                <div class="bar">
                  <div class="fill" [style.width.%]="c.percent" [style.background]="c.color"></div>
                </div>
              </div>
              <div class="right">
                <div>{{ c.amount | inr }}</div>
                <div class="muted pct">{{ c.percent }}%</div>
              </div>
            </div>
          } @empty {
            <p class="muted empty">No expenses this month</p>
          }
        </section>
      </div>
      </div>
    </div>

    @if (showFilters()) {
      <app-modal (closed)="closeFilters()">
        <app-filters (closed)="closeFilters()" />
      </app-modal>
    }
  `,
  styles: [
    `
      .btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: var(--chip-bg);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 10px;
        padding: 0.5rem 0.85rem;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .toolbar {
        margin-bottom: 1rem;
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(280px, 360px) 1fr;
        gap: 1rem;
        align-items: start;
      }
      .chart-card {
        display: flex;
        justify-content: center;
        padding: 1.5rem;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--row-border);
      }
      .row:last-child {
        border-bottom: none;
      }
      .mid {
        flex: 1;
        min-width: 0;
      }
      .name {
        font-weight: 600;
        margin-bottom: 0.4rem;
      }
      .bar {
        height: 6px;
        background: var(--badge-bg);
        border-radius: 3px;
        overflow: hidden;
      }
      .fill {
        height: 100%;
        border-radius: 3px;
      }
      .right {
        text-align: right;
        font-weight: 600;
        min-width: 6rem;
      }
      .pct {
        font-size: 0.8rem;
        font-weight: 400;
      }
      .empty {
        text-align: center;
        padding: 2rem;
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CategoriesComponent implements OnInit {
  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());
  summary = signal<Summary>({ income: 0, expense: 0, net: 0 });
  breakdown = signal<CategoryBreakdown>({ total: 0, categories: [] });
  donutValues = signal<number[]>([]);
  donutColors = signal<string[]>([]);
  showFilters = signal(false);

  constructor(
    private analytics: AnalyticsService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  openFilters(): void {
    this.showFilters.set(true);
  }

  closeFilters(): void {
    this.showFilters.set(false);
  }

  changeMonth(delta: number): void {
    const next = shiftMonth(this.month(), this.year(), delta);
    this.month.set(next.month);
    this.year.set(next.year);
    this.load();
  }

  load(): void {
    const m = this.month();
    const y = this.year();
    this.analytics.summary(m, y).subscribe((s) => this.summary.set(s));
    this.analytics.byCategory(m, y, 'expense').subscribe((b) => {
      this.breakdown.set(b);
      this.donutValues.set(b.categories.map((c) => c.amount));
      this.donutColors.set(b.categories.map((c) => c.color));
    });
  }
}
