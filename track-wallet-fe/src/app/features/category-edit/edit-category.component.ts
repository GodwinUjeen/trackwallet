import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { SegmentedComponent } from '../../shared/components/segmented.component';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';
import { IconPickerComponent } from './icon-picker.component';
import { EditSubcategoryComponent } from './edit-subcategory.component';

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [
    FormsModule,
    CategoryIconComponent,
    SegmentedComponent,
    ModalComponent,
    IconPickerComponent,
    EditSubcategoryComponent,
  ],
  template: `
    <div class="cat-form">
      <header class="dlg-header">
        <button type="button" class="icon-btn" (click)="closed.emit(false)">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2>{{ isNew ? 'New category' : 'Edit category' }}</h2>
        <button type="button" class="icon-btn" (click)="save()" aria-label="Save">
          <span class="material-symbols-outlined">check</span>
        </button>
      </header>

      @if (isNew) {
        <app-segmented
          [options]="typeOpts"
          [value]="type()"
          [showCheck]="true"
          (valueChange)="type.set($event)"
        />
      }

      <div class="name-row">
        <input class="field" placeholder="Name" [(ngModel)]="name" />
        <button type="button" class="icon-pick" (click)="showIcon.set(true)">
          <app-category-icon [icon]="icon()" [color]="color()" [size]="56" />
        </button>
      </div>

      <div class="sub-head">
        <span>Subcategories</span>
        @if (!isNew && id) {
          <button type="button" class="icon-btn" (click)="showSub.set(true)">
            <span class="material-symbols-outlined">playlist_add</span>
          </button>
        }
      </div>

      @for (s of subcategories(); track s._id) {
        <div class="list-row">
          <app-category-icon [icon]="s.icon" [color]="s.color" [size]="36" />
          <span class="grow">{{ s.name }}</span>
          <button type="button" class="icon-btn" (click)="deleteSub(s._id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      }

      @if (!isNew) {
        <button type="button" class="danger" (click)="remove()">Delete category</button>
      }
    </div>

    @if (showIcon()) {
      <app-modal [wide]="true" [tall]="true" (closed)="showIcon.set(false)">
        <app-icon-picker
          [initialIcon]="icon()"
          [initialColor]="color()"
          (closed)="onIconPicked($event)"
        />
      </app-modal>
    }

    @if (showSub() && id) {
      <app-modal [wide]="true" [tall]="true" (closed)="showSub.set(false)">
        <app-edit-subcategory
          [parentId]="id"
          [initialIcon]="icon()"
          [initialColor]="color()"
          (closed)="onSubClosed($event)"
        />
      </app-modal>
    }
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
      .name-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        margin: 1rem 0;
      }
      .icon-pick {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
      }
      .sub-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1rem 0 0.5rem;
        font-weight: 600;
      }
      .grow {
        flex: 1;
      }
      .list-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 0;
        border-bottom: 1px solid var(--row-border);
      }
      .danger {
        margin-top: 1.5rem;
        width: 100%;
        background: transparent;
        border: 1px solid var(--expense);
        color: var(--expense);
        border-radius: 10px;
        padding: 0.75rem;
        cursor: pointer;
      }
    `,
  ],
})
export class EditCategoryComponent implements OnInit {
  @Input() categoryId: string | null = null;
  @Input() defaultType: 'income' | 'expense' = 'expense';
  @Output() closed = new EventEmitter<boolean>();

  typeOpts = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ];
  isNew = true;
  id: string | null = null;
  name = '';
  type = signal('expense');
  icon = signal('shopping_cart');
  color = signal('#E91E63');
  subcategories = signal<Category[]>([]);
  showIcon = signal(false);
  showSub = signal(false);

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.type.set(this.defaultType);
    if (this.categoryId) {
      this.isNew = false;
      this.id = this.categoryId;
      this.categoryService.get(this.categoryId).subscribe((c) => {
        this.name = c.name;
        this.type.set(c.type);
        this.icon.set(c.icon);
        this.color.set(c.color);
        this.subcategories.set(c.subcategories || []);
      });
    }
  }

  onIconPicked(result: { icon: string; color: string } | null): void {
    this.showIcon.set(false);
    if (result) {
      this.icon.set(result.icon);
      this.color.set(result.color);
    }
  }

  onSubClosed(saved: boolean): void {
    this.showSub.set(false);
    if (saved && this.id) {
      this.categoryService.get(this.id).subscribe((c) => {
        this.subcategories.set(c.subcategories || []);
      });
    }
  }

  save(): void {
    if (!this.name.trim()) return;
    if (this.isNew) {
      this.categoryService
        .create({
          name: this.name.trim(),
          type: this.type() as 'income' | 'expense',
          icon: this.icon(),
          color: this.color(),
        })
        .subscribe({
          next: (c) => {
            this.isNew = false;
            this.id = c._id;
            this.closed.emit(true);
          },
          error: () => alert('Failed to create category'),
        });
    } else if (this.id) {
      this.categoryService
        .update(this.id, {
          name: this.name.trim(),
          icon: this.icon(),
          color: this.color(),
          type: this.type() as 'income' | 'expense',
        })
        .subscribe({
          next: () => this.closed.emit(true),
          error: () => alert('Failed to update category'),
        });
    }
  }

  deleteSub(id: string): void {
    if (!confirm('Delete subcategory?')) return;
    this.categoryService.delete(id).subscribe(() => {
      this.subcategories.update((list) => list.filter((s) => s._id !== id));
    });
  }

  remove(): void {
    if (!this.id || !confirm('Delete this category and its subcategories?')) return;
    this.categoryService.delete(this.id).subscribe(() => this.closed.emit(true));
  }
}
