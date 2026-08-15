import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from '../../shared/components/side-nav.component';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { MonthNavComponent } from '../../shared/components/month-nav.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { TransactionService } from '../../core/services/transaction.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import { Account, Category, Summary, Transaction } from '../../core/models';
import { formatDayHeader, formatTime, monthBounds, shiftMonth } from '../../shared/utils/format';
import { TransactionFormComponent } from './transaction-form.component';
import { FiltersComponent } from '../filters/filters.component';

interface DayGroup {
  key: string;
  label: string;
  net: number;
  items: Transaction[];
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    FormsModule,
    SideNavComponent,
    CategoryIconComponent,
    MonthNavComponent,
    ModalComponent,
    InrPipe,
    TransactionFormComponent,
    FiltersComponent,
  ],
  template: `
    <app-side-nav />
    <div class="page">
      <header class="page-header">
        <h1>Transactions</h1>
        <button type="button" class="btn-primary-inline" (click)="openNew()">
          <span class="material-symbols-outlined">add</span>
          Add transaction
        </button>
      </header>

      <div class="page-body page-body--split">
      <div class="toolbar card">
        <div class="search-bar">
          <span class="material-symbols-outlined muted">search</span>
          <input
            class="search"
            placeholder="Search notes"
            [(ngModel)]="search"
            (ngModelChange)="load()"
          />
        </div>
        <app-month-nav
          [month]="month()"
          [year]="year()"
          [showFilter]="true"
          (prev)="changeMonth(-1)"
          (next)="changeMonth(1)"
          (filter)="openFilters()"
        />
        <div class="summary">
          <div class="stat">
            <span class="muted">Income</span>
            <span class="income">{{ summary().income | inr }}</span>
          </div>
          <div class="stat">
            <span class="muted">Expenses</span>
            <span class="expense">{{ summary().expense | inr }}</span>
          </div>
          <div class="stat">
            <span class="muted">Net</span>
            <span [class.income]="summary().net >= 0" [class.expense]="summary().net < 0">
              {{ summary().net | inr: { signed: true } }}
            </span>
          </div>
        </div>
      </div>

      <div class="card list-card">
        @for (g of groups(); track g.key) {
          <div class="day-head">
            <span>{{ g.label }}</span>
            <span [class.expense]="g.net < 0" [class.income]="g.net >= 0">
              Σ {{ g.net | inr: { signed: true } }}
            </span>
          </div>
          @for (tx of g.items; track tx._id) {
            <button type="button" class="tx-row" (click)="openEdit(tx._id)">
              <app-category-icon
                [icon]="iconOf(tx)"
                [color]="colorOf(tx)"
                [size]="40"
                shape="square"
              />
              <div class="mid">
                <div class="title">{{ titleOf(tx) }}</div>
                <div class="meta">
                  <span [style.color]="accountOf(tx)?.color">{{ accountOf(tx)?.name }}</span>
                  @if (tx.note) {
                    <span class="muted"> · {{ tx.note }}</span>
                  }
                </div>
              </div>
              <div class="right">
                <div [class.income]="tx.amount > 0" [class.expense]="tx.amount < 0">
                  {{ tx.amount | inr: { abs: true } }}
                </div>
                <div class="muted time">{{ formatTime(tx.date) }}</div>
              </div>
            </button>
          }
        } @empty {
          <p class="muted empty">No transactions</p>
        }
      </div>
      </div>
    </div>

    @if (showDialog()) {
      <app-modal [wide]="true" [tall]="true" (closed)="closeDialog(false)">
        <app-transaction-form
          [transactionId]="editingId()"
          (closed)="closeDialog($event)"
        />
      </app-modal>
    }

    @if (showFilters()) {
      <app-modal (closed)="closeFilters(false)">
        <app-filters (closed)="closeFilters($event)" />
      </app-modal>
    }
  `,
  styles: [
    `
      .page-body--split {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-bottom: 0;
      }
      .toolbar {
        flex-shrink: 0;
      }
      .list-card {
        flex: 1;
        min-height: 0;
        margin-bottom: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
      }
      .btn-primary-inline {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 0.55rem 1rem;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
      }
      .toolbar {
        display: grid;
        grid-template-columns: 1.4fr 1fr auto;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
      }
      .search-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--surface-2);
        border-radius: 10px;
        padding: 0.55rem 0.85rem;
        border: 1px solid var(--border);
      }
      .search {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text);
        outline: none;
      }
      .summary {
        display: flex;
        gap: 1.25rem;
      }
      .stat {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        font-weight: 600;
        font-size: 0.95rem;
        min-width: 5.5rem;
      }
      .stat .muted {
        font-size: 0.75rem;
        font-weight: 500;
      }
      .day-head {
        display: flex;
        justify-content: space-between;
        padding: 1rem 0.35rem 0.5rem;
        font-size: 0.85rem;
        color: var(--muted);
        font-weight: 600;
        border-top: 1px solid var(--row-border);
        margin-top: 0.35rem;
      }
      .day-head:first-child {
        border-top: none;
        margin-top: 0;
        padding-top: 0.25rem;
      }
      .tx-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.85rem;
        align-items: center;
        width: 100%;
        padding: 0.75rem 0.5rem;
        text-align: left;
        background: transparent;
        border: none;
        color: inherit;
        border-radius: 10px;
        cursor: pointer;
        font: inherit;
      }
      .tx-row:hover {
        background: var(--hover);
      }
      .mid {
        min-width: 0;
      }
      .title {
        font-weight: 600;
        font-size: 0.95rem;
      }
      .meta {
        font-size: 0.82rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .right {
        text-align: right;
        font-weight: 600;
      }
      .time {
        font-size: 0.75rem;
        font-weight: 400;
      }
      .empty {
        text-align: center;
        padding: 2rem;
      }
      @media (max-width: 1000px) {
        .toolbar {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TransactionsComponent implements OnInit {
  month = signal(new Date().getMonth() + 1);
  year = signal(new Date().getFullYear());
  summary = signal<Summary>({ income: 0, expense: 0, net: 0 });
  transactions = signal<Transaction[]>([]);
  search = '';
  formatTime = formatTime;
  showDialog = signal(false);
  editingId = signal<string | null>(null);
  showFilters = signal(false);

  groups = computed(() => {
    const map = new Map<string, DayGroup>();
    for (const tx of this.transactions()) {
      const d = new Date(tx.date);
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) {
        map.set(key, { key, label: formatDayHeader(d), net: 0, items: [] });
      }
      const g = map.get(key)!;
      g.items.push(tx);
      if (tx.type !== 'transfer') g.net += tx.amount;
    }
    return [...map.values()];
  });

  constructor(
    private txService: TransactionService,
    private analytics: AnalyticsService,
    private filters: FilterStateService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  openNew(): void {
    this.editingId.set(null);
    this.showDialog.set(true);
  }

  openEdit(id: string): void {
    this.editingId.set(id);
    this.showDialog.set(true);
  }

  closeDialog(saved: boolean): void {
    this.showDialog.set(false);
    this.editingId.set(null);
    if (saved) this.load();
  }

  openFilters(): void {
    this.showFilters.set(true);
  }

  closeFilters(applied: boolean): void {
    this.showFilters.set(false);
    if (applied) this.load();
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
    const { from, to } = monthBounds(m, y);
    const f = this.filters.filters();
    this.analytics.summary(m, y).subscribe((s) => this.summary.set(s));
    this.txService
      .list({
        from,
        to,
        type: f.types.length && f.types.length < 3 ? f.types.join(',') : undefined,
        accountIds: f.accountIds.length ? f.accountIds : undefined,
        categoryIds: f.categoryIds.length ? f.categoryIds : undefined,
        search: this.search || undefined,
      })
      .subscribe((txs) => this.transactions.set(txs));
  }

  accountOf(tx: Transaction): Account | null {
    return typeof tx.accountId === 'object' && tx.accountId ? (tx.accountId as Account) : null;
  }

  categoryOf(tx: Transaction): Category | null {
    return typeof tx.categoryId === 'object' && tx.categoryId ? (tx.categoryId as Category) : null;
  }

  subOf(tx: Transaction): Category | null {
    return typeof tx.subcategoryId === 'object' && tx.subcategoryId
      ? (tx.subcategoryId as Category)
      : null;
  }

  iconOf(tx: Transaction): string {
    if (tx.type === 'transfer') return 'swap_horiz';
    return this.subOf(tx)?.icon || this.categoryOf(tx)?.icon || 'category';
  }

  colorOf(tx: Transaction): string {
    if (tx.type === 'transfer') return '#1E88E5';
    return this.subOf(tx)?.color || this.categoryOf(tx)?.color || '#9E9E9E';
  }

  titleOf(tx: Transaction): string {
    if (tx.type === 'transfer') {
      const from = this.accountOf(tx)?.name || '';
      const to =
        typeof tx.toAccountId === 'object' && tx.toAccountId
          ? (tx.toAccountId as Account).name
          : '';
      return `Transfer · ${from} → ${to}`;
    }
    const cat = this.categoryOf(tx)?.name || 'Uncategorized';
    const sub = this.subOf(tx)?.name;
    return sub ? `${cat} · ${sub}` : cat;
  }
}
