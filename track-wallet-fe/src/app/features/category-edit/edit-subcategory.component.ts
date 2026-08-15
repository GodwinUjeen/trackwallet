import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { CategoryService } from '../../core/services/category.service';
import { ICON_COLORS, ICON_GROUPS } from '../../shared/utils/format';

@Component({
  selector: 'app-edit-subcategory',
  standalone: true,
  imports: [FormsModule, CategoryIconComponent],
  template: `
    <div class="sub-form">
      <header class="dlg-header">
        <button type="button" class="icon-btn" (click)="closed.emit(false)">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2>New subcategory</h2>
        <span style="width:40px"></span>
      </header>

      <div class="name-row">
        <app-category-icon [icon]="icon()" [color]="color()" [size]="48" />
        <input class="field" placeholder="Name" [(ngModel)]="name" />
      </div>

      <div class="colors">
        @for (c of colors; track c) {
          <button type="button" class="swatch" [style.background]="c" (click)="color.set(c)">
            @if (c === color()) {
              <span class="material-symbols-outlined">check</span>
            }
          </button>
        }
      </div>

      @for (g of groups; track g.label) {
        <div class="group-label">{{ g.label }}</div>
        <div class="icons">
          @for (ic of g.icons; track ic) {
            <button
              type="button"
              class="icon-cell"
              [class.selected]="ic === icon()"
              (click)="icon.set(ic)"
            >
              <span class="material-symbols-outlined">{{ ic }}</span>
            </button>
          }
        </div>
      }

      <button class="btn-primary" type="button" [disabled]="!name.trim()" (click)="save()">
        Save
      </button>
    </div>
  `,
  styles: [
    `
      .dlg-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
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
        margin: 0.75rem 0 1rem;
      }
      .colors {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .swatch {
        aspect-ratio: 1;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .swatch .material-symbols-outlined {
        font-size: 1rem;
      }
      .group-label {
        color: var(--muted);
        font-size: 0.8rem;
        margin: 0.75rem 0 0.35rem;
      }
      .icons {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 0.25rem;
      }
      .icon-cell {
        background: transparent;
        border: none;
        color: var(--text);
        border-radius: 50%;
        aspect-ratio: 1;
        cursor: pointer;
      }
      .icon-cell.selected {
        background: var(--badge-bg);
      }
      .btn-primary {
        margin-top: 1.25rem;
      }
    `,
  ],
})
export class EditSubcategoryComponent implements OnInit {
  @Input({ required: true }) parentId!: string;
  @Input() initialIcon = 'restaurant';
  @Input() initialColor = '#FF9800';
  @Output() closed = new EventEmitter<boolean>();

  colors = ICON_COLORS;
  groups = ICON_GROUPS;
  name = '';
  icon = signal('restaurant');
  color = signal('#FF9800');

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.icon.set(this.initialIcon);
    this.color.set(this.initialColor);
  }

  save(): void {
    if (!this.name.trim() || !this.parentId) return;
    this.categoryService
      .create({
        name: this.name.trim(),
        type: 'expense',
        parentId: this.parentId,
        icon: this.icon(),
        color: this.color(),
      } as never)
      .subscribe({
        next: () => this.closed.emit(true),
        error: () => alert('Failed to create subcategory'),
      });
  }
}
