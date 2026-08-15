import { Component, OnInit, computed, signal } from '@angular/core';
import { SideNavComponent } from '../../shared/components/side-nav.component';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { AccountService } from '../../core/services/account.service';
import { Account, AccountType } from '../../core/models';
import { ACCOUNT_TYPE_OPTIONS, accountTypeLabel, creditAvailable } from '../../shared/utils/account';
import { AccountFormComponent } from './account-form.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    SideNavComponent,
    CategoryIconComponent,
    ModalComponent,
    InrPipe,
    AccountFormComponent,
  ],
  template: `
    <app-side-nav />
    <div class="page">
      <header class="page-header">
        <h1>Accounts</h1>
        <button type="button" class="btn-primary-inline" (click)="openNew()">
          <span class="material-symbols-outlined">add</span>
          Add account
        </button>
      </header>

      <div class="page-body">
      @for (group of groups(); track group.type) {
        <section class="card">
          <div class="card-title">
            <span class="group-title">
              <span class="material-symbols-outlined" [style.color]="group.color">{{ group.icon }}</span>
              {{ group.label }}
            </span>
            <span class="muted">{{ group.accounts.length }}</span>
          </div>
          @for (a of group.accounts; track a._id) {
            <button type="button" class="list-row" (click)="openEdit(a._id)">
              <app-category-icon [icon]="a.icon" [color]="a.color" [size]="40" shape="square" />
              <div class="mid">
                <div class="name">{{ a.name }}</div>
                <div class="badge">{{ accountTypeLabel(a.accountType) }}</div>
                @if (a.accountType === 'credit_card' && a.creditLimit != null) {
                  <div class="limit-meta muted">
                    Limit {{ a.creditLimit | inr }}
                    @if (available(a) !== null) {
                      · Available {{ available(a)! | inr }}
                    }
                  </div>
                }
              </div>
              <div class="bal">{{ a.balance | inr }}</div>
              <span class="material-symbols-outlined muted">chevron_right</span>
            </button>
          } @empty {
            <p class="muted empty">No {{ group.label.toLowerCase() }}s yet</p>
          }
        </section>
      }
      </div>
    </div>

    @if (showDialog()) {
      <app-modal (closed)="closeDialog(false)">
        <app-account-form [accountId]="editingId()" (closed)="closeDialog($event)" />
      </app-modal>
    }
  `,
  styles: [
    `
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
      .group-title {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
      }
      .list-row {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        width: 100%;
        padding: 0.85rem 0.25rem;
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--row-border);
        color: inherit;
        cursor: pointer;
        font: inherit;
        text-align: left;
      }
      .list-row:hover {
        background: var(--hover);
        border-radius: 8px;
      }
      .list-row:last-child {
        border-bottom: none;
      }
      .mid {
        flex: 1;
        min-width: 0;
      }
      .name {
        font-weight: 600;
      }
      .badge {
        display: inline-block;
        margin-top: 0.2rem;
        font-size: 0.75rem;
        color: var(--muted);
        background: var(--badge-bg);
        border-radius: 999px;
        padding: 0.15rem 0.55rem;
      }
      .limit-meta {
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
      .bal {
        font-weight: 600;
      }
      .muted {
        color: var(--muted);
      }
      .empty {
        padding: 0.75rem 0;
        margin: 0;
      }
    `,
  ],
})
export class AccountsComponent implements OnInit {
  accounts = signal<Account[]>([]);
  showDialog = signal(false);
  editingId = signal<string | null>(null);
  accountTypeLabel = accountTypeLabel;

  groups = computed(() =>
    ACCOUNT_TYPE_OPTIONS.map((opt) => ({
      type: opt.value as AccountType,
      label: opt.label,
      icon: opt.icon,
      color: opt.color,
      accounts: this.accounts().filter((a) => (a.accountType || 'bank') === opt.value),
    }))
  );

  constructor(private accountService: AccountService) {}

  available(a: Account): number | null {
    return creditAvailable(a);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.accountService.list().subscribe((a) => this.accounts.set(a));
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
}
