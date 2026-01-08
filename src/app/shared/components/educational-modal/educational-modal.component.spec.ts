import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EducationalModalComponent } from './educational-modal.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [EducationalModalComponent],
  template: `
    <app-educational-modal [title]="'Test Title'" (closed)="onClosed()">
      <p>Test content</p>
    </app-educational-modal>
  `,
})
class TestHostComponent {
  onClosed = jest.fn();
}

describe('EducationalModalComponent', () => {
  let component: EducationalModalComponent;
  let fixture: ComponentFixture<EducationalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationalModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EducationalModalComponent);
    fixture.componentRef.setInput('title', 'Test Title');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be closed by default', () => {
    expect(component.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
  });

  it('should open when open() is called', () => {
    component.open();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeTruthy();
  });

  it('should display the title', () => {
    component.open();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.modal-title');
    expect(title.textContent).toBe('Test Title');
  });

  it('should close when close() is called', () => {
    component.open();
    fixture.detectChanges();

    component.close();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
  });

  it('should close when clicking the close button', () => {
    component.open();
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should close when clicking the "Got it" button', () => {
    component.open();
    fixture.detectChanges();

    const gotItButton = fixture.nativeElement.querySelector('.btn-primary');
    gotItButton.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should close when clicking the backdrop', () => {
    component.open();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    backdrop.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should not close when clicking modal content', () => {
    component.open();
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.modal-content');
    content.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
  });

  it('should close on escape key', () => {
    component.open();
    fixture.detectChanges();

    component.onEscapeKey();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should emit closed event when closing', () => {
    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    component.open();
    component.close();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should toggle open/closed state', () => {
    expect(component.isOpen()).toBe(false);

    component.toggle();
    expect(component.isOpen()).toBe(true);

    component.toggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should have proper aria attributes', () => {
    component.open();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toContain('modal-title-');
  });
});

describe('EducationalModalComponent with host', () => {
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

  it('should project content', () => {
    const modal = fixture.debugElement.children[0].componentInstance as EducationalModalComponent;
    modal.open();
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.modal-body p');
    expect(content.textContent).toBe('Test content');
  });

  it('should emit closed event to host', () => {
    const modal = fixture.debugElement.children[0].componentInstance as EducationalModalComponent;
    modal.open();
    modal.close();

    expect(hostComponent.onClosed).toHaveBeenCalled();
  });
});
