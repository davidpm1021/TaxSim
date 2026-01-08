import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContinueButtonComponent } from './continue-button.component';

describe('ContinueButtonComponent', () => {
  let component: ContinueButtonComponent;
  let fixture: ComponentFixture<ContinueButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContinueButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContinueButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default button text', () => {
    const button = fixture.nativeElement.querySelector('.btn-continue');
    expect(button.textContent).toContain('Continue');
  });

  it('should display custom button text', () => {
    fixture.componentRef.setInput('buttonText', 'See Results');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.btn-continue');
    expect(button.textContent).toContain('See Results');
  });

  it('should show arrow icon by default', () => {
    const arrow = fixture.nativeElement.querySelector('.btn-continue .arrow');
    expect(arrow).toBeTruthy();
  });

  it('should show check icon on last step instead of arrow', () => {
    fixture.componentRef.setInput('isLastStep', true);
    fixture.detectChanges();

    const arrow = fixture.nativeElement.querySelector('.btn-continue .arrow');
    const check = fixture.nativeElement.querySelector('.btn-continue .check');
    expect(arrow).toBeNull();
    expect(check).toBeTruthy();
  });

  it('should show back button by default', () => {
    const backButton = fixture.nativeElement.querySelector('.btn-back');
    expect(backButton).toBeTruthy();
    expect(backButton.textContent).toContain('Back');
  });

  it('should hide back button when showBack is false', () => {
    fixture.componentRef.setInput('showBack', false);
    fixture.detectChanges();

    const backButton = fixture.nativeElement.querySelector('.btn-back');
    expect(backButton).toBeNull();
  });

  it('should emit continue event on click', () => {
    const continueSpy = jest.fn();
    component.continue.subscribe(continueSpy);

    const button = fixture.nativeElement.querySelector('.btn-continue');
    button.click();

    expect(continueSpy).toHaveBeenCalled();
  });

  it('should emit back event on back click', () => {
    const backSpy = jest.fn();
    component.back.subscribe(backSpy);

    const button = fixture.nativeElement.querySelector('.btn-back');
    button.click();

    expect(backSpy).toHaveBeenCalled();
  });

  it('should disable continue button when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.btn-continue');
    expect(button.disabled).toBe(true);
  });

  it('should not emit continue when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const continueSpy = jest.fn();
    component.continue.subscribe(continueSpy);

    component.onContinue();

    expect(continueSpy).not.toHaveBeenCalled();
  });

  it('should disable back button when backDisabled is true', () => {
    fixture.componentRef.setInput('backDisabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.btn-back');
    expect(button.disabled).toBe(true);
  });

  it('should not emit back when backDisabled', () => {
    fixture.componentRef.setInput('backDisabled', true);
    fixture.detectChanges();

    const backSpy = jest.fn();
    component.back.subscribe(backSpy);

    component.onBack();

    expect(backSpy).not.toHaveBeenCalled();
  });

  it('should have proper button types', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => {
      expect(button.type).toBe('button');
    });
  });
});
