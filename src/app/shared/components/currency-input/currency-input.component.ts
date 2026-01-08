import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-currency-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="currency-input-wrapper" [class.focused]="isFocused()" [class.disabled]="disabled()">
      <span class="currency-symbol">$</span>
      <input
        #inputElement
        type="text"
        inputmode="numeric"
        [id]="inputId()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="displayValue()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (keydown)="onKeyDown($event)"
        class="currency-input"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="ariaDescribedBy()"
      />
    </div>
  `,
  styles: `
    .currency-input-wrapper {
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 0.625rem 0.875rem;
      transition: border-color 0.15s, box-shadow 0.15s;

      &:hover:not(.disabled) {
        border-color: #9ca3af;
      }

      &.focused {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
      }

      &.disabled {
        background: #f3f4f6;
        cursor: not-allowed;
      }
    }

    .currency-symbol {
      color: #6b7280;
      font-size: 1rem;
      font-weight: 500;
      margin-right: 0.25rem;
      user-select: none;
    }

    .currency-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 1rem;
      font-family: inherit;
      color: #1f2937;
      outline: none;
      min-width: 0;

      &::placeholder {
        color: #9ca3af;
      }

      &:disabled {
        cursor: not-allowed;
        color: #6b7280;
      }
    }

    /* Hide spinner buttons for number inputs */
    .currency-input::-webkit-outer-spin-button,
    .currency-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .currency-input[type='number'] {
      -moz-appearance: textfield;
    }
  `,
})
export class CurrencyInputComponent implements ControlValueAccessor {
  inputId = input<string>('');
  placeholder = input<string>('0');
  ariaLabel = input<string>('');
  ariaDescribedBy = input<string>('');

  readonly disabled = signal(false);
  readonly isFocused = signal(false);

  private readonly value = signal<number>(0);
  private readonly rawInput = signal<string>('');
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputElement');

  // Display formatted value when not focused, raw input when focused
  readonly displayValue = computed(() => {
    if (this.isFocused()) {
      return this.rawInput();
    }
    return this.formatForDisplay(this.value());
  });

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    const numValue = value ?? 0;
    this.value.set(numValue);
    // Store raw input as whole number string (no decimals for simplicity)
    this.rawInput.set(numValue === 0 ? '' : Math.round(numValue).toString());
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    // Allow only digits (no decimals - treating as whole dollars)
    const sanitized = rawValue.replace(/[^0-9]/g, '');

    // Update input value if it was sanitized
    if (sanitized !== rawValue) {
      input.value = sanitized;
    }

    // Store raw input and parse numeric value
    this.rawInput.set(sanitized);
    const numericValue = parseInt(sanitized, 10) || 0;
    this.value.set(numericValue);
    this.onChange(numericValue);
  }

  onFocus(): void {
    this.isFocused.set(true);
    // Select all text when focusing for easy replacement
    setTimeout(() => {
      this.inputElement()?.nativeElement?.select();
    }, 0);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  onKeyDown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Block non-numeric keys (no decimal point - whole dollars only)
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  private formatForDisplay(value: number): string {
    if (value === 0) {
      return '';
    }

    // Format with commas, no decimal places (whole dollars)
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Public method to programmatically focus the input
  focus(): void {
    this.inputElement()?.nativeElement?.focus();
  }
}
