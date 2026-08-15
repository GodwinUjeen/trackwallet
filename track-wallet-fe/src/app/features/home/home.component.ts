import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SideNavComponent } from '../../shared/components/side-nav.component';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { DonutChartComponent } from '../../shared/components/donut-chart.component';
import { LineChartComponent, LineSeries } from '../../shared/components/line-chart.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { AccountService } from '../../core/services/account.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';
import { Account, CategoryBreakdown, Summary } from '../../core/models';
import { monthLabel, shiftMonth } from '../../shared/utils/format';
import { accountTypeLabel, creditAvailable } from '../../shared/utils/account';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SideNavComponent,
    CategoryIconComponent,
    DonutChartComponent,
    LineChartComponent,
    InrPipe,
    RouterLink,
  ],
  template: `
    <app-side-nav />
    <div class="page">
      <header class="page-header">
        <h1>Home</h1>
        <button type="button" class="btn-ghost" title="Import CSV" (click)="fileInput.click()">
          <span class="material-symbols-outlined">upload_file</span>
          Import CSV
        </button>
        <input #fileInput type="file" accept=".csv,text/csv" hidden (change)="onImport($event)" />
      </header>

      <div class="page-body">
        <section class="hero card">
          <div class="hero-main">
            <div class="hero-label muted">Total balance</div>
            <div class="hero-value">{{ currentTotal() | inr }}</div>
            <div class="hero-hint muted">Excluding credit cards</div>
          </div>
          <div class="hero-meta">
            <div
              class="delta"
              [class.income]="monthDelta() >= 0"
              [class.expense]="monthDelta() < 0"
            >
              {{ monthDelta() | inr: { signed: true } }}
            </div>
            <div class="month-shift muted">
              <button type="button" class="icon-btn" (click)="changeMonth(-1)">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <span>{{ label() }}</span>
              <button type="button" class="icon-btn" (click)="changeMonth(1)">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        <section class="kpi-row">
          <div class="card kpi">
            <div class="kpi-top">
              <span class="material-symbols-outlined income">arrow_upward</span>
              <span class="muted">Income</span>
            </div>
            <div class="kpi-value income">{{ summary().income | inr }}</div>
          </div>
          <div class="card kpi">
            <div class="kpi-top">
              <span class="material-symbols-outlined expense">arrow_downward</span>
              <span class="muted">Expenses</span>
            </div>
            <div class="kpi-value expense">{{ summary().expense | inr }}</div>
          </div>
          <div class="card kpi">
            <div class="kpi-top">
              <span class="material-symbols-outlined">balance</span>
              <span class="muted">Net</span>
            </div>
            <div
              class="kpi-value"
              [class.income]="summary().net >= 0"
              [class.expense]="summary().net < 0"
            >
              {{ summary().net | inr: { signed: true } }}
            </div>
          </div>
        </section>

        <section class="card accounts-card">
          <div class="card-title">
            <a routerLink="/accounts">Accounts</a>
            <a routerLink="/accounts" class="muted link-more">
              Manage
              <span class="material-symbols-outlined">chevron_right</span>
            </a>
          </div>
          <div class="accounts">
            @for (a of accounts(); track a._id) {
              <div class="account">
                <app-category-icon [icon]="a.icon" [color]="a.color" [size]="40" />
                <div class="account-copy">
                  <div class="name">{{ a.name }}</div>
                  <div class="type-badge">{{ typeLabel(a.accountType) }}</div>
                  <div class="bal">{{ a.balance | inr }}</div>
                  @if (a.accountType === 'credit_card' && a.creditLimit != null) {
                    <div class="limit-line muted">
                      Limit {{ a.creditLimit | inr }}
                      @if (avail(a) !== null) {
                        · Avail {{ avail(a)! | inr }}
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <div class="bottom-split">
          <section class="card cats-card">
            <div class="card-title">
              <a routerLink="/categories">Categories</a>
              <span class="muted">{{ label() }}</span>
            </div>
            <div class="cat-grid">
              <app-donut-chart [values]="donutValues()" [colors]="donutColors()">
                <span class="expense donut-label">{{ summary().expense | inr }}</span>
                <span class="muted donut-sub">Expense</span>
              </app-donut-chart>
              <div class="cat-list">
                @for (c of breakdown().categories.slice(0, 6); track c.categoryId) {
                  <div class="mini-row">
                    <app-category-icon [icon]="c.icon" [color]="c.color" [size]="28" />
                    <span class="grow">{{ c.name }}</span>
                    <span class="amt">{{ c.amount | inr }}</span>
                  </div>
                } @empty {
                  <p class="muted empty">No expenses this month</p>
                }
              </div>
            </div>
          </section>

          <section class="card trend-card">
            <div class="card-title">
              <span>Balance this month</span>
              <span class="muted">{{ label() }}</span>
            </div>
            <app-line-chart [labels]="balanceLabels()" [series]="balanceSeries()" />
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: var(--chip-bg);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 10px;
        padding: 0.55rem 0.9rem;
        cursor: pointer;
        font-size: 0.9rem;
      }
      .btn-ghost:hover {
        background: var(--hover);
      }
      .hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1.5rem;
        margin-bottom: 1rem;
        padding: 1.35rem 1.5rem;
      }
      .hero-label {
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 0.35rem;
      }
      .hero-value {
        font-size: clamp(1.85rem, 3vw, 2.5rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.1;
      }
      .hero-hint {
        font-size: 0.78rem;
        margin-top: 0.4rem;
      }
      .hero-meta {
        text-align: right;
        flex-shrink: 0;
      }
      .delta {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.35rem;
      }
      .month-shift {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.25rem;
        font-size: 0.9rem;
      }
      .kpi-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .kpi {
        margin-bottom: 0;
        padding: 1.1rem 1.25rem;
      }
      .kpi-top {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 0.55rem;
        font-size: 0.85rem;
      }
      .kpi-top .material-symbols-outlined {
        font-size: 1.15rem;
      }
      .kpi-value {
        font-size: 1.45rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .accounts-card {
        margin-bottom: 1rem;
      }
      .accounts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.85rem;
      }
      .account {
        display: flex;
        gap: 0.85rem;
        align-items: center;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 0.95rem 1.05rem;
        min-width: 0;
      }
      .account-copy {
        min-width: 0;
        flex: 1;
      }
      .name {
        font-weight: 600;
        font-size: 0.95rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .type-badge {
        font-size: 0.7rem;
        color: var(--muted);
        margin: 0.1rem 0 0.25rem;
      }
      .bal {
        font-size: 0.95rem;
        font-weight: 600;
      }
      .limit-line {
        font-size: 0.7rem;
        margin-top: 0.2rem;
      }
      .link-more {
        display: inline-flex;
        align-items: center;
        gap: 0.15rem;
        text-decoration: none;
        font-size: 0.85rem;
      }
      .link-more .material-symbols-outlined {
        font-size: 1.1rem;
      }
      .bottom-split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        align-items: stretch;
      }
      .cats-card,
      .trend-card {
        margin-bottom: 0;
        min-width: 0;
      }
      .cat-grid {
        display: grid;
        grid-template-columns: minmax(140px, 200px) 1fr;
        gap: 1.25rem;
        align-items: center;
      }
      .donut-label {
        font-weight: 700;
        font-size: 0.95rem;
      }
      .donut-sub {
        font-size: 0.75rem;
        margin-top: 0.15rem;
      }
      .mini-row {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        font-size: 0.9rem;
        padding: 0.45rem 0;
        border-bottom: 1px solid var(--row-border);
      }
      .mini-row:last-child {
        border-bottom: none;
      }
      .grow {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .amt {
        font-weight: 600;
        flex-shrink: 0;
      }
      .empty {
        margin: 0.5rem 0 0;
        font-size: 0.9rem;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      a:hover {
        color: var(--accent);
      }
      @media (max-width: 1100px) {
        .bottom-split {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 900px) {
        .kpi-row {
          grid-template-columns: 1fr;
        }
        .hero {
          flex-direction: column;
          align-items: flex-start;
        }
        .hero-meta {
          text-align: left;
        }
        .month-shift {
          justify-content: flex-start;
        }
        .cat-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  accounts = signal<Account[]>([]);
  summary = signal<Summary>({ income: 0, expense: 0, net: 0 });
  breakdown = signal<CategoryBreakdown>({ total: 0, categories: [] });
  currentTotal = signal(0);
  balanceLabels = signal<string[]>([]);
  balanceSeries = signal<LineSeries[]>([]);
  monthDelta = signal(0);
  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());
  label = signal('');
  donutValues = signal<number[]>([]);
  donutColors = signal<string[]>([]);
  typeLabel = accountTypeLabel;

  avail(a: Account): number | null {
    return creditAvailable(a);
  }

  constructor(
    private accountService: AccountService,
    private analytics: AnalyticsService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
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
    this.label.set(monthLabel(m, y));
    forkJoin({
      accounts: this.accountService.list(),
      summary: this.analytics.summary(m, y),
      cats: this.analytics.byCategory(m, y, 'expense'),
      balance: this.analytics.balanceSeries(m, y),
    }).subscribe({
      next: ({ accounts, summary, cats, balance }) => {
        this.accounts.set(accounts);
        this.summary.set(summary);
        this.breakdown.set(cats);
        this.donutValues.set(cats.categories.map((c) => c.amount));
        this.donutColors.set(cats.categories.map((c) => c.color));
        this.currentTotal.set(balance.currentTotal);
        this.balanceLabels.set(
          balance.series.map((s) => {
            const d = s.date.slice(8);
            return d === '01' || Number(d) % 5 === 0 ? s.date.slice(5) : '';
          })
        );
        this.balanceSeries.set([
          { label: 'Balance', data: balance.series.map((s) => s.balance), color: '#64B5F6' },
        ]);
        if (balance.series.length >= 2) {
          const first = balance.series[0].balance;
          const last = balance.series[balance.series.length - 1].balance;
          this.monthDelta.set(last - first);
        } else {
          this.monthDelta.set(0);
        }
      },
    });
  }

  onImport(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.analytics.importCsv(file).subscribe({
      next: () => {
        input.value = '';
        this.load();
      },
      error: () => {
        input.value = '';
        alert('CSV import failed');
      },
    });
  }
}
