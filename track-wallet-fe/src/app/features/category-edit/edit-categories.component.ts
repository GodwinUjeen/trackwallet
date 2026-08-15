import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { SideNavComponent } from '../../shared/components/side-nav.component';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';
import { EditCategoryComponent } from './edit-category.component';

@Component({
  selector: 'app-edit-categories',
  standalone: true,
  imports: [CategoryIconComponent, ModalComponent, SideNavComponent, EditCategoryComponent],
  template: `
    <app-side-nav />
    <div class="page">
      <header class="page-header">
        <button type="button" class="icon-btn" (click)="router.navigateByUrl('/categories')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>Edit categories</h1>
        <button type="button" class="btn-primary-inline" (click)="openNew()">
          <span class="material-symbols-outlined">add</span>
          Add
        </button>
      </header>

      <div class="page-body">
      <div class="tabs">
        <button type="button" [class.active]="type() === 'income'" (click)="setType('income')">
          Income
        </button>
        <button type="button" [class.active]="type() === 'expense'" (click)="setType('expense')">
          Expense
        </button>
      </div>

      <div class="card">
        @for (c of categories(); track c._id) {
          <button type="button" class="list-row" (click)="openEdit(c._id)">
            <app-category-icon [icon]="c.icon" [color]="c.color" [size]="40" />
            <span class="name">{{ c.name }}</span>
            <span class="material-symbols-outlined muted">chevron_right</span>
          </button>
        }
      </div>
      </div>
    </div>

    @if (showDialog()) {
      <app-modal (closed)="closeDialog(false)">
        <app-edit-category
          [categoryId]="editingId()"
          [defaultType]="type()"
          (closed)="closeDialog($event)"
        />
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
      .tabs {
        display: flex;
        gap: 1.5rem;
        border-bottom: 1px solid var(--border);
        margin-bottom: 1rem;
      }
      .tabs button {
        background: none;
        border: none;
        color: var(--muted);
        padding: 0.75rem 0;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        font: inherit;
      }
      .tabs button.active {
        color: var(--text);
        border-bottom-color: var(--text);
      }
      .name {
        flex: 1;
        font-weight: 600;
        text-align: left;
      }
      .list-row {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        width: 100%;
        padding: 0.85rem 0.35rem;
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--row-border);
        color: inherit;
        cursor: pointer;
        font: inherit;
        border-radius: 8px;
      }
      .list-row:hover {
        background: var(--hover);
      }
      .list-row:last-child {
        border-bottom: none;
      }
      .muted {
        color: var(--muted);
      }
    `,
  ],
})
export class EditCategoriesComponent implements OnInit {
  type = signal<'income' | 'expense'>('expense');
  categories = signal<Category[]>([]);
  showDialog = signal(false);
  editingId = signal<string | null>(null);

  constructor(
    private categoryService: CategoryService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  setType(t: 'income' | 'expense'): void {
    this.type.set(t);
    this.load();
  }

  load(): void {
    this.categoryService
      .list({ type: this.type(), top: true })
      .subscribe((c) => this.categories.set(c));
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
