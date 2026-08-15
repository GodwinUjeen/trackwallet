import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-category-icon',
  standalone: true,
  template: `
    <span
      class="cat-icon"
      [class.square]="shape === 'square'"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.background]="color"
      [style.font-size.px]="size * 0.5"
    >
      <span class="material-symbols-outlined">{{ icon || 'category' }}</span>
    </span>
  `,
  styles: [
    `
      .cat-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: #fff;
        flex-shrink: 0;
      }
      .cat-icon.square {
        border-radius: 10px;
      }
      .material-symbols-outlined {
        font-size: inherit;
        line-height: 1;
      }
    `,
  ],
})
export class CategoryIconComponent {
  @Input() icon = 'category';
  @Input() color = '#9E9E9E';
  @Input() size = 40;
  @Input() shape: 'circle' | 'square' = 'circle';
}
