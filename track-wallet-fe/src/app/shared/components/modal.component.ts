import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="backdrop" (click)="onBackdrop()">
      <div
        class="panel"
        [class.wide]="wide"
        [class.tall]="tall"
        role="dialog"
        aria-modal="true"
        (click)="$event.stopPropagation()"
      >
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: var(--backdrop);
        backdrop-filter: blur(4px);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        animation: fadeIn 0.15s ease;
      }
      .panel {
        width: min(560px, 100%);
        max-height: min(90dvh, 900px);
        overflow: auto;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--panel-shadow);
        padding: 1.25rem 1.35rem 1.5rem;
        animation: riseIn 0.18s ease;
      }
      .panel.wide {
        width: min(720px, 100%);
      }
      .panel.tall {
        max-height: min(92dvh, 960px);
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes riseIn {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
    `,
  ],
})
export class ModalComponent {
  @Input() wide = false;
  @Input() tall = false;
  @Input() closeOnBackdrop = true;
  @Output() closed = new EventEmitter<void>();

  onBackdrop(): void {
    if (this.closeOnBackdrop) this.closed.emit();
  }
}
