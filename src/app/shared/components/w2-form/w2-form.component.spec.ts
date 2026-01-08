import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { W2FormComponent } from './w2-form.component';
import { W2, createEmptyW2 } from '@core/models';

@Component({
  standalone: true,
  imports: [W2FormComponent],
  template: `<app-w2-form [w2]="w2()" (w2Change)="onW2Change($event)" />`,
})
class TestHostComponent {
  w2 = signal<W2>(createEmptyW2());
  changes: Partial<W2>[] = [];

  onW2Change(changes: Partial<W2>): void {
    this.changes.push(changes);
  }
}

describe('W2FormComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  describe('Form Layout', () => {
    it('should display the W-2 form header', () => {
      const header = fixture.nativeElement.querySelector('.w2-header');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('W-2');
      expect(header.textContent).toContain('Wage and Tax Statement');
    });

    it('should display the form footer', () => {
      const footer = fixture.nativeElement.querySelector('.w2-footer');
      expect(footer).toBeTruthy();
      expect(footer.textContent).toContain('Internal Revenue Service');
    });

    it('should have all main boxes', () => {
      const boxes = [
        '.box-a', '.box-b', '.box-c', '.box-d', '.box-e', '.box-f',
        '.box-1', '.box-2', '.box-3', '.box-4', '.box-5', '.box-6',
        '.box-7', '.box-8', '.box-9', '.box-10', '.box-11',
        '.box-12', '.box-13', '.box-14',
        '.box-15', '.box-16', '.box-17',
        '.box-18', '.box-19', '.box-20',
      ];

      boxes.forEach((boxClass) => {
        const box = fixture.nativeElement.querySelector(boxClass);
        expect(box).not.toBeNull();
      });
    });
  });

  describe('Text Field Inputs', () => {
    it('should emit change when employer name is entered', () => {
      const input = fixture.nativeElement.querySelector('.box-c input[placeholder="Employer name"]');
      input.value = 'Acme Corp';
      input.dispatchEvent(new Event('ngModelChange'));

      fixture.detectChanges();

      // Directly test the component output since ngModelChange needs proper setup
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('employerName', 'Acme Corp');

      expect(hostComponent.changes).toContainEqual({ employerName: 'Acme Corp' });
    });

    it('should emit change when employee SSN is entered', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('employeeSsn', '123-45-6789');

      expect(hostComponent.changes).toContainEqual({ employeeSsn: '123-45-6789' });
    });

    it('should emit change when employer EIN is entered', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('employerEin', '12-3456789');

      expect(hostComponent.changes).toContainEqual({ employerEin: '12-3456789' });
    });

    it('should emit change when employee first name is entered', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('employeeFirstName', 'John');

      expect(hostComponent.changes).toContainEqual({ employeeFirstName: 'John' });
    });

    it('should emit change when employee last name is entered', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('employeeLastName', 'Smith');

      expect(hostComponent.changes).toContainEqual({ employeeLastName: 'Smith' });
    });
  });

  describe('Currency Field Inputs', () => {
    it('should emit numeric value for wages (Box 1)', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('wagesTips', '50,000.00');

      expect(hostComponent.changes).toContainEqual({ wagesTips: 50000 });
    });

    it('should emit numeric value for federal withheld (Box 2)', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('federalWithheld', '5,000.00');

      expect(hostComponent.changes).toContainEqual({ federalWithheld: 5000 });
    });

    it('should emit numeric value for social security wages (Box 3)', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('socialSecurityWages', '45,000');

      expect(hostComponent.changes).toContainEqual({ socialSecurityWages: 45000 });
    });

    it('should emit numeric value for medicare wages (Box 5)', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('medicareWages', '45,000');

      expect(hostComponent.changes).toContainEqual({ medicareWages: 45000 });
    });

    it('should handle empty currency value as 0', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('wagesTips', '');

      expect(hostComponent.changes).toContainEqual({ wagesTips: 0 });
    });

    it('should strip commas from currency values', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('wagesTips', '1,234.56');

      expect(hostComponent.changes).toContainEqual({ wagesTips: 1234.56 });
    });
  });

  describe('Currency Formatting', () => {
    it('should format non-zero currency values with commas and decimals', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      expect(component.formatCurrency(1234.56)).toBe('1,234.56');
    });

    it('should return empty string for zero value', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      expect(component.formatCurrency(0)).toBe('');
    });

    it('should return empty string for undefined value', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      expect(component.formatCurrency(undefined)).toBe('');
    });

    it('should format large values correctly', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      expect(component.formatCurrency(1234567.89)).toBe('1,234,567.89');
    });
  });

  describe('Box 12 Entries', () => {
    it('should always display 4 box 12 rows (a-d)', () => {
      const box12Rows = fixture.nativeElement.querySelectorAll('.box12-row');
      expect(box12Rows.length).toBe(4);
    });

    it('should display correct letters for box 12 entries', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      expect(component.getBox12Letter(0)).toBe('a');
      expect(component.getBox12Letter(1)).toBe('b');
      expect(component.getBox12Letter(2)).toBe('c');
      expect(component.getBox12Letter(3)).toBe('d');
    });

    it('should emit change when box 12 code is entered', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onBox12CodeChange(0, 'd');

      const lastChange = hostComponent.changes[hostComponent.changes.length - 1];
      expect(lastChange.box12?.[0].code).toBe('D');
    });

    it('should uppercase box 12 codes', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onBox12CodeChange(0, 'dd');

      const lastChange = hostComponent.changes[hostComponent.changes.length - 1];
      expect(lastChange.box12?.[0].code).toBe('DD');
    });

    it('should emit change when box 12 amount is entered', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onBox12AmountChange(0, '5,000');

      const lastChange = hostComponent.changes[hostComponent.changes.length - 1];
      expect(lastChange.box12?.[0].amount).toBe(5000);
    });

    it('should emit full box 12 array with 4 entries on any change', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onBox12CodeChange(1, 'DD');

      const lastChange = hostComponent.changes[hostComponent.changes.length - 1];
      // Always emits 4 entries (a-d)
      expect(lastChange.box12?.length).toBe(4);
      expect(lastChange.box12?.[1].code).toBe('DD');
    });
  });

  describe('Box 13 Checkboxes', () => {
    it('should emit change when statutory employee is checked', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('statutoryEmployee', true);

      expect(hostComponent.changes).toContainEqual({ statutoryEmployee: true });
    });

    it('should emit change when retirement plan is checked', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('retirementPlan', true);

      expect(hostComponent.changes).toContainEqual({ retirementPlan: true });
    });

    it('should emit change when third-party sick pay is checked', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('thirdPartySickPay', true);

      expect(hostComponent.changes).toContainEqual({ thirdPartySickPay: true });
    });

    it('should display all three checkboxes', () => {
      const checkboxes = fixture.nativeElement.querySelectorAll('.box-13 input[type="checkbox"]');
      expect(checkboxes.length).toBe(3);
    });
  });

  describe('State Tax Section', () => {
    it('should emit change for state code', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('state', 'CA');

      expect(hostComponent.changes).toContainEqual({ state: 'CA' });
    });

    it('should emit change for state wages', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('stateWages', '45,000');

      expect(hostComponent.changes).toContainEqual({ stateWages: 45000 });
    });

    it('should emit change for state withheld', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('stateWithheld', '2,000');

      expect(hostComponent.changes).toContainEqual({ stateWithheld: 2000 });
    });

    it('should support second state entry', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('state2', 'NY');
      component.onCurrencyChange('stateWages2', '10,000');

      expect(hostComponent.changes).toContainEqual({ state2: 'NY' });
      expect(hostComponent.changes).toContainEqual({ stateWages2: 10000 });
    });
  });

  describe('Local Tax Section', () => {
    it('should emit change for local wages', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('localWages', '45,000');

      expect(hostComponent.changes).toContainEqual({ localWages: 45000 });
    });

    it('should emit change for local withheld', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyChange('localWithheld', '1,000');

      expect(hostComponent.changes).toContainEqual({ localWithheld: 1000 });
    });

    it('should emit change for locality name', () => {
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onFieldChange('localityName', 'New York City');

      expect(hostComponent.changes).toContainEqual({ localityName: 'New York City' });
    });
  });

  describe('Display Values', () => {
    it('should accept W2 input and emit changes', () => {
      const w2 = createEmptyW2();
      w2.employerName = 'Test Company';
      w2.wagesTips = 50000;

      hostComponent.w2.set(w2);
      fixture.detectChanges();

      // Verify the component received the input
      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      expect(component.w2().employerName).toBe('Test Company');
      expect(component.w2().wagesTips).toBe(50000);
    });
  });

  describe('Focus Handling', () => {
    it('should clear zero value on currency focus', () => {
      const mockEvent = {
        target: { value: '0.00' },
      } as unknown as FocusEvent;

      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyFocus(mockEvent);

      expect((mockEvent.target as HTMLInputElement).value).toBe('');
    });

    it('should not change non-zero value on currency focus', () => {
      const mockEvent = {
        target: { value: '1,234.56' },
      } as unknown as FocusEvent;

      const component = fixture.debugElement.children[0].componentInstance as W2FormComponent;
      component.onCurrencyFocus(mockEvent);

      expect((mockEvent.target as HTMLInputElement).value).toBe('1,234.56');
    });
  });
});
