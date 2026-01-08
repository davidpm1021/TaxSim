import { Injectable, signal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';

const STORAGE_KEY = 'tax-simulation-data';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  private readonly _taxReturn = signal<TaxReturn>(createEmptyTaxReturn());

  readonly taxReturn = this._taxReturn.asReadonly();

  constructor() {
    this.load();
  }

  save(data: TaxReturn): void {
    this._taxReturn.set(data);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to sessionStorage:', e);
    }
  }

  load(): TaxReturn {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TaxReturn;
        this._taxReturn.set(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load from sessionStorage:', e);
    }
    return this._taxReturn();
  }

  clear(): void {
    this._taxReturn.set(createEmptyTaxReturn());
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e);
    }
  }

  updatePersonalInfo(updater: (current: TaxReturn['personalInfo']) => TaxReturn['personalInfo']): void {
    const current = this._taxReturn();
    this.save({
      ...current,
      personalInfo: updater(current.personalInfo),
    });
  }

  updateIncome(updater: (current: TaxReturn['income']) => TaxReturn['income']): void {
    const current = this._taxReturn();
    this.save({
      ...current,
      income: updater(current.income),
    });
  }

  updateAdjustments(updater: (current: TaxReturn['adjustments']) => TaxReturn['adjustments']): void {
    const current = this._taxReturn();
    this.save({
      ...current,
      adjustments: updater(current.adjustments),
    });
  }

  updateDeductions(updater: (current: TaxReturn['deductions']) => TaxReturn['deductions']): void {
    const current = this._taxReturn();
    this.save({
      ...current,
      deductions: updater(current.deductions),
    });
  }

  updateCredits(updater: (current: TaxReturn['credits']) => TaxReturn['credits']): void {
    const current = this._taxReturn();
    this.save({
      ...current,
      credits: updater(current.credits),
    });
  }

  updateCalculation(calculation: TaxReturn['calculation']): void {
    const current = this._taxReturn();
    this.save({
      ...current,
      calculation,
    });
  }
}
