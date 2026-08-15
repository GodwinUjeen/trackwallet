import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-segmented',
  standalone: true,
  template: `
    <div class="seg" [class.compact]="compact">
      @for (opt of options; track opt.value) {
        <button
          type="button"
          [class.active]="opt.value === value"
          (click)="valueChange.emit(opt.value)"
        >
          @if (opt.value === value && showCheck) {
            <span class="material-symbols-outlined check">check</span>
          }
          {{ opt.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .seg {
        display: flex;
        background: var(--chip-bg);
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid var(--border);
      }
      button {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--muted);
        padding: 0.65rem 0.5rem;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
      }
      button.active {
        background: var(--hover);
        color: var(--text);
        box-shadow: inset 0 0 0 1px var(--border);
      }
      .check {
        font-size: 1rem;
        color: var(--income);
      }
      .compact button {
        padding: 0.45rem 0.75rem;
        border-radius: 999px;
        flex: 0 0 auto;
      }
      .compact {
        gap: 0.35rem;
        background: transparent;
        border: none;
      }
      .compact button.active {
        background: var(--badge-bg);
        border-radius: 999px;
      }
    `,
  ],
})
export class SegmentedComponent {
  @Input() options: { label: string; value: string }[] = [];
  @Input() value = '';
  @Input() showCheck = false;
  @Input() compact = false;
  @Output() valueChange = new EventEmitter<string>();
}
