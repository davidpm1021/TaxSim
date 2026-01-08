import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <div class="validation-error" role="alert" aria-live="polite">
        <span class="error-icon" aria-hidden="true">!</span>
        <span>{{ error() }}</span>
      </div>
    }
  `,
  styles: `
    .validation-error {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.375rem;
      font-size: 0.875rem;
      color: var(--ngpf-error);
      font-weight: 500;
    }

    .error-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      min-width: 16px;
      background: var(--ngpf-error);
      color: white;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 700;
    }
  `,
})
export class ValidationMessageComponent {
  error = input<string | null>(null);
}
