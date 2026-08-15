import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { SegmentedComponent } from '../../shared/components/segmented.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account, Category, Transaction } from '../../core/models';
import { accountTypeLabel } from '../../shared/utils/account';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [FormsModule, CategoryIconComponent, SegmentedComponent, InrPipe],
  template: `
    <div class="dialog-form">
      <header class="dlg-header">
        <button type="button" class="icon-btn" (click)="closed.emit(false)">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2>{{ editId ? 'Edit' : 'New' }} transaction</h2>
        @if (editId) {
          <button type="button" class="icon-btn" (click)="remove()" aria-label="Delete">
            <span class="material-symbols-outlined">delete</span>
          </button>
        } @else {
          <span style="width:40px"></span>
        }
      </header>

      <app-segmented
        [options]="typeOpts"
        [value]="type()"
        [showCheck]="true"
        (valueChange)="onTypeChange($event)"
      />

      <label class="field-label">Date & time</label>
      <input class="field" type="datetime-local" [(ngModel)]="dateLocal" />

      <label class="field-label">Account</label>
      <div class="account-grid">
        @for (a of accounts(); track a._id) {
          <button
            type="button"
            class="chip"
            [class.selected]="a._id === accountId()"
            (click)="accountId.set(a._id)"
          >
            <app-category-icon [icon]="a.icon" [color]="a.color" [size]="28" />
            <div>
              <div class="chip-name">{{ a.name }}</div>
              <div class="type-badge">{{ typeLabel(a.accountType) }}</div>
              <div class="muted">{{ a.balance | inr }}</div>
            </div>
          </button>
        }
      </div>

      @if (type() === 'transfer') {
        <label class="field-label">To account</label>
        <div class="account-grid">
          @for (a of accounts(); track a._id) {
            @if (a._id !== accountId()) {
              <button
                type="button"
                class="chip"
                [class.selected]="a._id === toAccountId()"
                (click)="toAccountId.set(a._id)"
              >
                <app-category-icon [icon]="a.icon" [color]="a.color" [size]="28" />
                <div>
                  <div class="chip-name">{{ a.name }}</div>
                  <div class="type-badge">{{ typeLabel(a.accountType) }}</div>
                </div>
              </button>
            }
          }
        </div>
      }

      <label class="field-label">Amount</label>
      <div class="amount-wrap" [class.expense]="type() === 'expense'" [class.income]="type() === 'income'">
        <input
          class="amount-input"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          placeholder="0"
          [(ngModel)]="amount"
        />
        <span class="currency">₹</span>
      </div>

      <label class="field-label">Note</label>
      <input class="field" placeholder="Add note" [(ngModel)]="note" />

      @if (type() !== 'transfer') {
        <div class="cat-fields">
          <div>
            <label class="field-label">Category</label>
            <select
              class="field select"
              [ngModel]="categoryId()"
              (ngModelChange)="onCategoryChange($event)"
            >
              <option value="">Select category</option>
              @for (c of categories(); track c._id) {
                <option [value]="c._id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="field-label">Subcategory</label>
            <select
              class="field select"
              [ngModel]="subcategoryId()"
              (ngModelChange)="subcategoryId.set($event)"
              [disabled]="!subcategories().length"
            >
              <option value="">{{ subcategories().length ? 'Optional' : 'None' }}</option>
              @for (s of subcategories(); track s._id) {
                <option [value]="s._id">{{ s.name }}</option>
              }
            </select>
          </div>
        </div>

        @if (selectedCategory(); as cat) {
          <div class="selected-cat">
            <app-category-icon [icon]="cat.icon" [color]="cat.color" [size]="36" />
            <div>
              <div class="chip-name">{{ cat.name }}</div>
              @if (selectedSub(); as sub) {
                <div class="muted">{{ sub.name }}</div>
              }
            </div>
          </div>
        }
      }

      <button type="button" class="btn-primary save" (click)="save()" [disabled]="!canSave()">
        {{ editId ? 'Save changes' : 'Add transaction' }}
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
      .field-label {
        display: block;
        margin: 0.85rem 0 0.4rem;
        font-size: 0.8rem;
        color: var(--muted);
        font-weight: 500;
      }
      .account-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.5rem;
      }
      .chip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--chip-bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 0.55rem 0.7rem;
        color: var(--text);
        cursor: pointer;
        text-align: left;
        font: inherit;
      }
      .chip.selected {
        border-color: var(--income);
        background: color-mix(in srgb, var(--income) 18%, var(--chip-bg));
      }
      .chip-name {
        font-weight: 600;
        font-size: 0.9rem;
      }
      .type-badge {
        font-size: 0.7rem;
        color: var(--muted);
        margin: 0.1rem 0;
      }
      .amount-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--input-bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 0.35rem 1rem;
      }
      .amount-wrap.expense {
        border-color: color-mix(in srgb, var(--expense) 35%, transparent);
      }
      .amount-wrap.income {
        border-color: color-mix(in srgb, var(--income) 35%, transparent);
      }
      .amount-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--expense);
        font-size: 1.75rem;
        font-weight: 700;
        padding: 0.55rem 0;
        min-width: 0;
      }
      .amount-wrap.income .amount-input {
        color: var(--income);
      }
      .amount-input::-webkit-outer-spin-button,
      .amount-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .amount-input[type='number'] {
        appearance: textfield;
        -moz-appearance: textfield;
      }
      .currency {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--muted);
      }
      .cat-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      .select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%239e9e9e'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.85rem center;
        padding-right: 2rem;
      }
      .select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .selected-cat {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-top: 0.85rem;
        padding: 0.65rem 0.75rem;
        background: var(--chip-bg);
        border-radius: 10px;
        border: 1px solid var(--border);
      }
      .save {
        margin-top: 1.35rem;
      }
      .muted {
        color: var(--muted);
        font-size: 0.8rem;
      }
      @media (max-width: 520px) {
        .cat-fields {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TransactionFormComponent implements OnInit {
  @Input() transactionId: string | null = null;
  @Output() closed = new EventEmitter<boolean>();

  typeOpts = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
    { label: 'Transfer', value: 'transfer' },
  ];
  type = signal('expense');
  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  subcategories = signal<Category[]>([]);
  accountId = signal('');
  toAccountId = signal('');
  categoryId = signal('');
  subcategoryId = signal('');
  note = '';
  dateLocal = '';
  amount: number | null = null;
  editId: string | null = null;
  typeLabel = accountTypeLabel;

  constructor(
    private accountService: AccountService,
    private categoryService: CategoryService,
    private txService: TransactionService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.dateLocal = this.toLocalInput(now);
    this.editId = this.transactionId;

    this.accountService.list().subscribe((accounts) => {
      this.accounts.set(accounts);
      if (accounts[0]) this.accountId.set(accounts[0]._id);
      if (this.editId) this.loadExisting(this.editId);
      else this.reloadCategories();
    });
  }

  selectedCategory(): Category | undefined {
    return this.categories().find((c) => c._id === this.categoryId());
  }

  selectedSub(): Category | undefined {
    return this.subcategories().find((s) => s._id === this.subcategoryId());
  }

  canSave(): boolean {
    const amt = Number(this.amount);
    if (!amt || amt <= 0 || !this.accountId()) return false;
    if (this.type() === 'transfer') return !!this.toAccountId();
    return !!this.categoryId();
  }

  onTypeChange(v: string): void {
    this.type.set(v);
    if (v !== 'transfer') this.reloadCategories();
  }

  private reloadCategories(): void {
    const t = this.type() === 'income' ? 'income' : 'expense';
    this.categoryService.list({ type: t, top: true }).subscribe((categories) => {
      this.categories.set(categories);
      if (categories[0]) this.onCategoryChange(categories[0]._id);
      else {
        this.categoryId.set('');
        this.subcategories.set([]);
        this.subcategoryId.set('');
      }
    });
  }

  onCategoryChange(id: string): void {
    this.categoryId.set(id);
    this.subcategoryId.set('');
    if (!id) {
      this.subcategories.set([]);
      return;
    }
    this.categoryService.list({ parentId: id }).subscribe((subs) => this.subcategories.set(subs));
  }

  save(): void {
    if (!this.canSave()) return;
    const amount = Math.abs(Number(this.amount));

    const body: Record<string, unknown> = {
      type: this.type(),
      amount,
      date: new Date(this.dateLocal).toISOString(),
      accountId: this.accountId(),
      note: this.note,
    };

    if (this.type() === 'transfer') {
      body['toAccountId'] = this.toAccountId();
    } else {
      body['categoryId'] = this.categoryId() || null;
      body['subcategoryId'] = this.subcategoryId() || null;
    }

    const req = this.editId
      ? this.txService.update(this.editId, body)
      : this.txService.create(body);

    req.subscribe({
      next: () => this.closed.emit(true),
      error: (err) => alert(err.error?.error || 'Save failed'),
    });
  }

  remove(): void {
    if (!this.editId || !confirm('Delete this transaction?')) return;
    this.txService.delete(this.editId).subscribe(() => this.closed.emit(true));
  }

  private loadExisting(id: string): void {
    this.txService.get(id).subscribe((tx: Transaction) => {
      this.type.set(tx.type);
      this.amount = Math.abs(tx.amount);
      this.note = tx.note || '';
      this.dateLocal = this.toLocalInput(new Date(tx.date));
      const accId = typeof tx.accountId === 'object' ? tx.accountId._id : tx.accountId;
      this.accountId.set(accId);
      if (tx.toAccountId) {
        const toId = typeof tx.toAccountId === 'object' ? tx.toAccountId._id : tx.toAccountId;
        this.toAccountId.set(toId as string);
      }
      if (tx.type === 'transfer') return;
      const catType = tx.type === 'income' ? 'income' : 'expense';
      this.categoryService.list({ type: catType, top: true }).subscribe((cats) => {
        this.categories.set(cats);
        if (tx.categoryId) {
          const catId = typeof tx.categoryId === 'object' ? tx.categoryId._id : tx.categoryId;
          this.onCategoryChange(catId as string);
          if (tx.subcategoryId) {
            const subId =
              typeof tx.subcategoryId === 'object' ? tx.subcategoryId._id : tx.subcategoryId;
            setTimeout(() => this.subcategoryId.set(subId as string), 200);
          }
        }
      });
    });
  }

  private toLocalInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
