import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-educational-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="close()">
        <div
          class="modal-content"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-title-' + modalId"
          (click)="$event.stopPropagation()"
          #modalContent
        >
          <header class="modal-header">
            <h2 [id]="'modal-title-' + modalId" class="modal-title">{{ title() }}</h2>
            <button
              class="close-button"
              (click)="close()"
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
          </header>

          <div class="modal-body">
            <ng-content></ng-content>
          </div>

          <footer class="modal-footer">
            <button class="btn-primary" (click)="close()" type="button">
              Got it
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 21, 65, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
      backdrop-filter: blur(4px);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      max-width: 520px;
      width: 100%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid var(--ngpf-gray-light);
      background: var(--ngpf-blue-pale);
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--ngpf-navy-dark);
      padding-right: 1rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--ngpf-gray);
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--ngpf-navy-dark);
        background: var(--ngpf-gray-pale);
      }

      &:focus {
        outline: 2px solid var(--ngpf-orange);
        outline-offset: 2px;
      }
    }

    .modal-body {
      padding: 1.75rem;
      overflow-y: auto;
      font-size: 1rem;
      line-height: 1.7;
      color: var(--ngpf-gray-dark);

      :host ::ng-deep {
        p {
          margin: 0 0 1rem;

          &:last-child {
            margin-bottom: 0;
          }
        }

        strong {
          color: var(--ngpf-navy-dark);
          font-weight: 600;
        }

        em {
          color: var(--ngpf-gray);
          font-style: italic;
        }

        ul, ol {
          margin: 0 0 1rem;
          padding-left: 1.5rem;
        }

        li {
          margin-bottom: 0.5rem;
        }
      }
    }

    .modal-footer {
      padding: 1.25rem 1.75rem;
      border-top: 1px solid var(--ngpf-gray-light);
      display: flex;
      justify-content: flex-end;
    }

    .btn-primary {
      background: var(--ngpf-orange);
      color: white;
      border: none;
      border-radius: var(--radius-xl);
      padding: 0.75rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--ngpf-orange-dark);
        transform: translateY(-1px);
      }

      &:focus {
        outline: 2px solid var(--ngpf-orange);
        outline-offset: 2px;
      }
    }
  `,
})
export class EducationalModalComponent {
  title = input.required<string>();
  closed = output<void>();

  readonly isOpen = signal(false);
  readonly modalId = Math.random().toString(36).substring(2, 9);

  private readonly modalContent = viewChild<ElementRef>('modalContent');

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  open(): void {
    this.isOpen.set(true);
    // Focus trap - focus the modal when opened
    setTimeout(() => {
      this.modalContent()?.nativeElement?.focus();
    });
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
}
