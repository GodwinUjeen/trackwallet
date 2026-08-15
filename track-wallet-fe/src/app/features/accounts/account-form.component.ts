import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { SegmentedComponent } from '../../shared/components/segmented.component';
import { AccountService } from '../../core/services/account.service';
import { AccountType } from '../../core/models';
import { ACCOUNT_TYPE_OPTIONS, accountTypeMeta, creditAvailable } from '../../shared/utils/account';
import { InrPipe } from '../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [FormsModule, CategoryIconComponent, SegmentedComponent, InrPipe],
  template: `
    <div class="form">
      <header class="dlg-header">
        <button type="button" class="icon-btn" (click)="closed.emit(false)">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2>{{ accountId ? 'Edit account' : 'New account' }}</h2>
        @if (accountId) {
          <button type="button" class="icon-btn" (click)="remove()" aria-label="Delete">
            <span class="material-symbols-outlined">delete</span>
          </button>
        } @else {
          <span style="width:40px"></span>
        }
      </header>

      <label class="field-label">Type</label>
      <app-segmented
        [options]="typeOpts"
        [value]="accountType()"
        [showCheck]="true"
        (valueChange)="onTypeChange($event)"
      />

      <div class="preview">
        <app-category-icon [icon]="icon()" [color]="color()" [size]="56" />
        <div>
          <div class="preview-type">{{ meta().label }}</div>
          <div class="muted">Icon & color follow type by default</div>
        </div>
      </div>

      <label class="field-label">Name</label>
      <input class="field" placeholder="Account name" [(ngModel)]="name" />

      <label class="field-label">
        {{ accountType() === 'credit_card' ? 'Current balance (owed as negative)' : 'Balance' }}
      </label>
      <div class="amount-wrap">
        <input
          class="amount-input"
          type="number"
          step="0.01"
          inputmode="decimal"
          [(ngModel)]="balance"
          placeholder="0"
        />
        <span class="currency">₹</span>
      </div>
      <p class="hint muted">
        @if (accountType() === 'credit_card') {
          Set opening balance if needed. Card spends reduce this balance further.
        } @else {
          Set or correct the current account balance.
        }
      </p>

      @if (accountType() === 'credit_card') {
        <label class="field-label">Credit limit</label>
        <div class="amount-wrap">
          <input
            class="amount-input limit"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            [(ngModel)]="creditLimit"
            placeholder="0"
          />
          <span class="currency">₹</span>
        </div>
        @if (available() !== null) {
          <p class="hint available">Available credit: {{ available()! | inr }}</p>
        }
      }

      <div class="row-2">
        <div>
          <label class="field-label">Icon</label>
          <input disabled class="field" [(ngModel)]="iconModel" (ngModelChange)="icon.set($event)" />
        </div>
        <div>
          <label class="field-label">Color</label>
          <input
            class="field color"
            type="color"
            [ngModel]="color()"
            (ngModelChange)="color.set($event)"
          />
        </div>
      </div>

      <button type="button" class="btn-primary save" [disabled]="!canSave()" (click)="save()">
        {{ accountId ? 'Save changes' : 'Add account' }}
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
      }
      .preview {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 1rem;
        padding: 0.75rem;
        background: var(--chip-bg);
        border-radius: 12px;
        border: 1px solid var(--border);
      }
      .preview-type {
        font-weight: 600;
      }
      .muted {
        color: var(--muted);
        font-size: 0.8rem;
      }
      .hint {
        margin: 0.35rem 0 0;
        font-size: 0.78rem;
      }
      .available {
        color: var(--income);
        font-weight: 600;
        font-size: 0.85rem;
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
      .amount-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text);
        font-size: 1.35rem;
        font-weight: 700;
        padding: 0.45rem 0;
        min-width: 0;
      }
      .amount-input.limit {
        color: #b39ddb;
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
        font-weight: 700;
        color: var(--muted);
      }
      .row-2 {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.75rem;
        align-items: end;
      }
      .color {
        width: 64px;
        height: 44px;
        padding: 0.25rem;
        cursor: pointer;
      }
      .save {
        margin-top: 1.35rem;
      }
    `,
  ],
})
export class AccountFormComponent implements OnInit {
  @Input() accountId: string | null = null;
  @Output() closed = new EventEmitter<boolean>();

  typeOpts = ACCOUNT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }));
  name = '';
  balance: number | null = 0;
  creditLimit: number | null = null;
  accountType = signal<AccountType>('bank');
  icon = signal('account_balance');
  color = signal('#E53935');
  iconModel = 'account_balance';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    if (this.accountId) {
      this.accountService.list().subscribe((accounts) => {
        const a = accounts.find((x) => x._id === this.accountId);
        if (!a) return;
        this.name = a.name;
        this.accountType.set(a.accountType || 'bank');
        this.icon.set(a.icon);
        this.color.set(a.color);
        this.iconModel = a.icon;
        this.balance = a.balance ?? 0;
        this.creditLimit = a.creditLimit ?? null;
      });
    } else {
      this.applyTypeDefaults('bank');
    }
  }

  meta() {
    return accountTypeMeta(this.accountType());
  }

  available(): number | null {
    if (this.accountType() !== 'credit_card') return null;
    const limit = this.creditLimit;
    if (limit == null || !Number.isFinite(Number(limit))) return null;
    return creditAvailable({ balance: Number(this.balance) || 0, creditLimit: Number(limit) });
  }

  canSave(): boolean {
    if (!this.name.trim()) return false;
    if (!Number.isFinite(Number(this.balance ?? 0))) return false;
    if (this.accountType() === 'credit_card') {
      const limit = Number(this.creditLimit);
      if (!Number.isFinite(limit) || limit < 0) return false;
    }
    return true;
  }

  onTypeChange(v: string): void {
    const prev = this.accountType();
    this.applyTypeDefaults(v as AccountType);
    if (v !== 'credit_card') this.creditLimit = null;
    else if (prev !== 'credit_card' && (this.creditLimit == null || this.creditLimit === 0)) {
      this.creditLimit = 0;
    }
  }

  private applyTypeDefaults(type: AccountType): void {
    this.accountType.set(type);
    const m = accountTypeMeta(type);
    this.icon.set(m.icon);
    this.color.set(m.color);
    this.iconModel = m.icon;
  }

  save(): void {
    if (!this.canSave()) return;
    const body: Record<string, unknown> = {
      name: this.name.trim(),
      accountType: this.accountType(),
      icon: this.icon(),
      color: this.color(),
      balance: Number(this.balance) || 0,
    };
    if (this.accountType() === 'credit_card') {
      body['creditLimit'] = Number(this.creditLimit) || 0;
    } else {
      body['creditLimit'] = null;
    }

    const req = this.accountId
      ? this.accountService.update(this.accountId, body)
      : this.accountService.create(body);
    req.subscribe({
      next: () => this.closed.emit(true),
      error: (err) => alert(err.error?.error || 'Save failed'),
    });
  }

  remove(): void {
    if (!this.accountId || !confirm('Delete this account?')) return;
    this.accountService.delete(this.accountId).subscribe({
      next: () => this.closed.emit(true),
      error: (err) => alert(err.error?.error || 'Delete failed'),
    });
  }
}
