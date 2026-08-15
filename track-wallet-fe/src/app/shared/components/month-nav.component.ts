import { Component, EventEmitter, Input, Output } from '@angular/core';
import { monthLabel } from '../utils/format';

@Component({
  selector: 'app-month-nav',
  standalone: true,
  template: `
    <div class="month-nav">
      <button type="button" class="icon-btn" (click)="prev.emit()" aria-label="Previous month">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <span class="label">{{ monthLabel(month, year) }}</span>
      <button type="button" class="icon-btn" (click)="next.emit()" aria-label="Next month">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
      @if (showFilter) {
        <button type="button" class="icon-btn filter" (click)="filter.emit()" aria-label="Filters">
          <span class="material-symbols-outlined">tune</span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .month-nav {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0;
      }
      .label {
        font-weight: 600;
        font-size: 0.95rem;
        min-width: 8rem;
        text-align: center;
      }
      .filter {
        margin-left: auto;
      }
    `,
  ],
})
export class MonthNavComponent {
  @Input({ required: true }) month!: number;
  @Input({ required: true }) year!: number;
  @Input() showFilter = false;
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() filter = new EventEmitter<void>();
  monthLabel = monthLabel;
}
