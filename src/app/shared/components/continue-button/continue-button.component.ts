import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-continue-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="button-container">
      @if (showBack()) {
        <button
          type="button"
          class="btn btn-back"
          [disabled]="backDisabled()"
          (click)="onBack()"
        >
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span>Back</span>
        </button>
      }

      <button
        type="button"
        class="btn btn-continue"
        [class.disabled]="disabled()"
        [disabled]="disabled()"
        (click)="onContinue()"
      >
        <span class="btn-text">{{ buttonText() }}</span>
        @if (!isLastStep()) {
          <svg class="btn-icon arrow" viewBox="0 0 24 24">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        } @else {
          <svg class="btn-icon check" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        }
        <div class="btn-shine"></div>
      </button>
    </div>
  `,
  styles: `
    .button-container {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 2rem 0 0.5rem;
      margin-top: 1.5rem;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
      font-family: var(--font-body);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: none;
      position: relative;
      overflow: hidden;

      &:focus-visible {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
      }
    }

    .btn-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
      transition: transform 0.3s ease;
    }

    /* Back button */
    .btn-back {
      background: white;
      color: var(--ngpf-navy);
      border: 2px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      &:hover:not(:disabled) {
        background: #f8f9fc;
        border-color: #d1d5db;
        transform: translateX(-2px);
      }

      &:hover:not(:disabled) .btn-icon {
        transform: translateX(-3px);
      }

      &:active:not(:disabled) {
        transform: translateX(0);
      }

      &:disabled {
        opacity: 0.5;
        background: #f5f5f5;
      }
    }

    /* Continue button */
    .btn-continue {
      background: linear-gradient(135deg, #f4ad00 0%, #ff8c00 100%);
      color: #0b1541;
      box-shadow:
        0 4px 15px rgba(244, 173, 0, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.1);
      min-width: 160px;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow:
          0 8px 25px rgba(244, 173, 0, 0.4),
          0 2px 5px rgba(0, 0, 0, 0.1);
      }

      &:hover:not(:disabled) .arrow {
        transform: translateX(4px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow:
          0 2px 10px rgba(244, 173, 0, 0.3),
          0 1px 2px rgba(0, 0, 0, 0.1);
      }

      &.disabled,
      &:disabled {
        background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
        color: #6b7280;
        box-shadow: none;
        cursor: not-allowed;
      }
    }

    .btn-text {
      position: relative;
      z-index: 1;
    }

    .btn-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: left 0.5s ease;
    }

    .btn-continue:hover:not(:disabled) .btn-shine {
      left: 100%;
    }

    @media (max-width: 480px) {
      .button-container {
        flex-direction: column-reverse;
        gap: 0.75rem;
      }

      .btn {
        width: 100%;
        padding: 1rem 1.5rem;
      }

      .btn-back {
        background: transparent;
        border: none;
        box-shadow: none;

        &:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.03);
        }
      }
    }
  `,
})
export class ContinueButtonComponent {
  buttonText = input<string>('Continue');
  disabled = input<boolean>(false);
  showBack = input<boolean>(true);
  backDisabled = input<boolean>(false);
  isLastStep = input<boolean>(false);

  continue = output<void>();
  back = output<void>();

  onContinue(): void {
    if (!this.disabled()) {
      this.continue.emit();
    }
  }

  onBack(): void {
    if (!this.backDisabled()) {
      this.back.emit();
    }
  }
}
