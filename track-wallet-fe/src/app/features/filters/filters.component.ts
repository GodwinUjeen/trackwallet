import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { SegmentedComponent } from '../../shared/components/segmented.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import { Account, Category } from '../../core/models';
import { accountTypeLabel } from '../../shared/utils/account';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CategoryIconComponent, SegmentedComponent, InrPipe],
  template: `
    <div class="form">
      <header class="dlg-header">
        <button type="button" class="icon-btn" (click)="closed.emit(false)">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2>Filters</h2>
        <span style="width:40px"></span>
      </header>

      <app-segmented
        [options]="typeOpts"
        [value]="activeType()"
        (valueChange)="toggleType($event)"
      />

      <div class="tabs">
        <button type="button" [class.active]="tab() === 'accounts'" (click)="tab.set('accounts')">
          Accounts
        </button>
        <button
          type="button"
          [class.active]="tab() === 'categories'"
          (click)="tab.set('categories')"
        >
          Categories
        </button>
      </div>

      <div class="list">
        @if (tab() === 'accounts') {
          @for (a of accounts(); track a._id) {
            <label class="list-row">
              <app-category-icon [icon]="a.icon" [color]="a.color" [size]="40" shape="square" />
              <div class="grow">
                <div class="name">{{ a.name }}</div>
                <div class="type-badge">{{ typeLabel(a.accountType) }}</div>
                <div class="muted">{{ a.balance | inr }}</div>
              </div>
              <input
                type="checkbox"
                [checked]="selectedAccounts().has(a._id)"
                (change)="toggleAccount(a._id)"
              />
            </label>
          }
        } @else {
          @for (c of categories(); track c._id) {
            <label class="list-row">
              <app-category-icon [icon]="c.icon" [color]="c.color" [size]="40" />
              <div class="grow name">{{ c.name }}</div>
              <input
                type="checkbox"
                [checked]="selectedCategories().has(c._id)"
                (change)="toggleCategory(c._id)"
              />
            </label>
          }
        }
      </div>

      <button type="button" class="btn-primary apply" (click)="apply()">
        <span class="material-symbols-outlined">check</span>
        Apply
      </button>
    </div>
  `,
  styles: [
    `
      .dlg-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .dlg-header h2 {
        flex: 1;
        margin: 0;
        text-align: center;
        font-size: 1.15rem;
      }
      .tabs {
        display: flex;
        gap: 1.5rem;
        margin: 1rem 0 0.5rem;
        border-bottom: 1px solid var(--border);
      }
      .tabs button {
        background: none;
        border: none;
        color: var(--muted);
        padding: 0.75rem 0;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      .tabs button.active {
        color: var(--text);
        border-bottom-color: var(--text);
      }
      .list {
        max-height: min(48dvh, 420px);
        overflow-y: auto;
        margin: 0 -0.25rem;
        padding: 0 0.25rem;
      }
      .name {
        font-weight: 600;
      }
      .type-badge {
        font-size: 0.75rem;
        color: var(--muted);
        margin: 0.15rem 0;
      }
      .grow {
        flex: 1;
        min-width: 0;
      }
      input[type='checkbox'] {
        width: 20px;
        height: 20px;
        accent-color: var(--accent);
        flex-shrink: 0;
      }
      .apply {
        margin-top: 1.25rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
      }
    `,
  ],
})
export class FiltersComponent implements OnInit {
  @Output() closed = new EventEmitter<boolean>();

  typeOpts = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
    { label: 'Transfer', value: 'transfer' },
  ];
  tab = signal<'accounts' | 'categories'>('accounts');
  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  selectedAccounts = signal(new Set<string>());
  selectedCategories = signal(new Set<string>());
  selectedTypes = signal(new Set<string>(['income', 'expense', 'transfer']));
  activeType = signal('expense');
  typeLabel = accountTypeLabel;

  constructor(
    private accountService: AccountService,
    private categoryService: CategoryService,
    private filterState: FilterStateService
  ) {}

  ngOnInit(): void {
    const f = this.filterState.filters();
    this.selectedAccounts.set(new Set(f.accountIds));
    this.selectedCategories.set(new Set(f.categoryIds));
    this.selectedTypes.set(new Set(f.types));
    if (f.types.length === 1) this.activeType.set(f.types[0]);
    forkJoin({
      accounts: this.accountService.list(),
      categories: this.categoryService.list({ top: true }),
    }).subscribe(({ accounts, categories }) => {
      this.accounts.set(accounts);
      this.categories.set(categories);
    });
  }

  toggleType(v: string): void {
    this.activeType.set(v);
    this.selectedTypes.set(new Set([v]));
  }

  toggleAccount(id: string): void {
    const set = new Set(this.selectedAccounts());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedAccounts.set(set);
  }

  toggleCategory(id: string): void {
    const set = new Set(this.selectedCategories());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedCategories.set(set);
  }

  apply(): void {
    this.filterState.set({
      types: [...this.selectedTypes()] as ('income' | 'expense' | 'transfer')[],
      accountIds: [...this.selectedAccounts()],
      categoryIds: [...this.selectedCategories()],
    });
    this.closed.emit(true);
  }
}
