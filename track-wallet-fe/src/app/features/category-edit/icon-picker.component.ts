import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CategoryIconComponent } from '../../shared/components/category-icon.component';
import { ICON_COLORS, ICON_GROUPS } from '../../shared/utils/format';

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CategoryIconComponent],
  template: `
    <div class="picker">
      <header class="dlg-header">
        <button type="button" class="icon-btn" (click)="closed.emit(null)">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2>Category icon</h2>
        <span style="width:40px"></span>
      </header>

      <div class="preview">
        <app-category-icon [icon]="icon()" [color]="color()" [size]="88" />
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

      <button type="button" class="btn-primary save" (click)="save()">Save</button>
    </div>
  `,
  styles: [
    `
      .dlg-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .dlg-header h2 {
        flex: 1;
        margin: 0;
        text-align: center;
        font-size: 1.15rem;
      }
      .preview {
        display: flex;
        justify-content: center;
        padding: 0.75rem 0 1rem;
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
      .save {
        margin-top: 1.25rem;
      }
    `,
  ],
})
export class IconPickerComponent implements OnInit {
  @Input() initialIcon = 'shopping_cart';
  @Input() initialColor = '#E91E63';
  @Output() closed = new EventEmitter<{ icon: string; color: string } | null>();

  colors = ICON_COLORS;
  groups = ICON_GROUPS;
  icon = signal('shopping_cart');
  color = signal('#E91E63');

  ngOnInit(): void {
    this.icon.set(this.initialIcon);
    this.color.set(this.initialColor);
  }

  save(): void {
    this.closed.emit({ icon: this.icon(), color: this.color() });
  }
}
