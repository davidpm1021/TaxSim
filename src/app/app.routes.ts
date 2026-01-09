import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  {
    path: 'welcome',
    children: [
      { path: '', redirectTo: 'landing', pathMatch: 'full' },
      {
        path: 'landing',
        loadComponent: () =>
          import('./features/welcome/welcome.component').then((m) => m.WelcomeComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/welcome/student-profile/student-profile.component').then(
            (m) => m.StudentProfileComponent
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/welcome/document-checklist/document-checklist.component').then(
            (m) => m.DocumentChecklistComponent
          ),
      },
    ],
  },
  {
    path: 'personal-info',
    children: [
      { path: '', redirectTo: 'filing-status', pathMatch: 'full' },
      {
        path: 'filing-status',
        loadComponent: () =>
          import('./features/personal-info/filing-status/filing-status.component').then(
            (m) => m.FilingStatusComponent
          ),
      },
      {
        path: 'basic-info',
        loadComponent: () =>
          import('./features/personal-info/basic-info/basic-info.component').then(
            (m) => m.BasicInfoComponent
          ),
      },
      {
        path: 'dependent-status',
        loadComponent: () =>
          import('./features/personal-info/dependent-status/dependent-status.component').then(
            (m) => m.DependentStatusComponent
          ),
      },
      {
        path: 'dependents',
        loadComponent: () =>
          import('./features/personal-info/dependents/dependents.component').then(
            (m) => m.DependentsComponent
          ),
      },
      {
        path: 'state',
        loadComponent: () =>
          import('./features/personal-info/state-selection/state-selection.component').then(
            (m) => m.StateSelectionComponent
          ),
      },
    ],
  },
  {
    path: 'income',
    children: [
      { path: '', redirectTo: 'types', pathMatch: 'full' },
      {
        path: 'types',
        loadComponent: () =>
          import('./features/income/income-types/income-types.component').then(
            (m) => m.IncomeTypesComponent
          ),
      },
      {
        path: 'w2',
        loadComponent: () =>
          import('./features/income/w2-entry/w2-entry.component').then((m) => m.W2EntryComponent),
      },
      {
        path: 'w2/:index',
        loadComponent: () =>
          import('./features/income/w2-entry/w2-entry.component').then((m) => m.W2EntryComponent),
      },
      {
        path: '1099',
        loadComponent: () =>
          import('./features/income/form-1099-entry/form-1099-entry.component').then(
            (m) => m.Form1099EntryComponent
          ),
      },
      {
        path: '1099/:index',
        loadComponent: () =>
          import('./features/income/form-1099-entry/form-1099-entry.component').then(
            (m) => m.Form1099EntryComponent
          ),
      },
      {
        path: '1099-int',
        loadComponent: () =>
          import('./features/income/form-1099-int-entry/form-1099-int-entry.component').then(
            (m) => m.Form1099INTEntryComponent
          ),
      },
      {
        path: '1099-int/:index',
        loadComponent: () =>
          import('./features/income/form-1099-int-entry/form-1099-int-entry.component').then(
            (m) => m.Form1099INTEntryComponent
          ),
      },
      {
        path: '1099-div',
        loadComponent: () =>
          import('./features/income/form-1099-div-entry/form-1099-div-entry.component').then(
            (m) => m.Form1099DIVEntryComponent
          ),
      },
      {
        path: '1099-div/:index',
        loadComponent: () =>
          import('./features/income/form-1099-div-entry/form-1099-div-entry.component').then(
            (m) => m.Form1099DIVEntryComponent
          ),
      },
      {
        path: '1099-k',
        loadComponent: () =>
          import('./features/income/form-1099-k-entry/form-1099-k-entry.component').then(
            (m) => m.Form1099KEntryComponent
          ),
      },
      {
        path: '1099-k/:index',
        loadComponent: () =>
          import('./features/income/form-1099-k-entry/form-1099-k-entry.component').then(
            (m) => m.Form1099KEntryComponent
          ),
      },
      {
        path: 'schedule-c',
        loadComponent: () =>
          import('./features/income/schedule-c-entry/schedule-c-entry.component').then(
            (m) => m.ScheduleCEntryComponent
          ),
      },
      {
        path: 'estimated-tax',
        loadComponent: () =>
          import('./features/income/estimated-tax-calculator/estimated-tax-calculator.component').then(
            (m) => m.EstimatedTaxCalculatorComponent
          ),
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('./features/income/income-summary/income-summary.component').then(
            (m) => m.IncomeSummaryComponent
          ),
      },
    ],
  },
  {
    path: 'deductions',
    children: [
      { path: '', redirectTo: 'itemized', pathMatch: 'full' },
      {
        path: 'itemized',
        loadComponent: () =>
          import('./features/deductions/itemized-entry/itemized-entry.component').then(
            (m) => m.ItemizedEntryComponent
          ),
      },
      {
        path: 'comparison',
        loadComponent: () =>
          import('./features/deductions/deduction-comparison/deduction-comparison.component').then(
            (m) => m.DeductionComparisonComponent
          ),
      },
    ],
  },
  {
    path: 'education',
    children: [
      { path: '', redirectTo: '1098-t', pathMatch: 'full' },
      {
        path: '1098-t',
        loadComponent: () =>
          import('./features/education/form-1098-t-entry/form-1098-t-entry.component').then(
            (m) => m.Form1098TEntryComponent
          ),
      },
      {
        path: 'scholarship-calculator',
        loadComponent: () =>
          import('./features/education/scholarship-calculator/scholarship-calculator.component').then(
            (m) => m.ScholarshipCalculatorComponent
          ),
      },
      {
        path: 'credits',
        loadComponent: () =>
          import('./features/education/education-credits/education-credits.component').then(
            (m) => m.EducationCreditsComponent
          ),
      },
    ],
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./features/credits/credits-summary/credits-summary.component').then(
        (m) => m.CreditsSummaryComponent
      ),
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./features/review/review.component').then((m) => m.ReviewComponent),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./features/results/results.component').then((m) => m.ResultsComponent),
  },
  {
    path: 'educational',
    children: [
      { path: '', redirectTo: 'filing-helper', pathMatch: 'full' },
      {
        path: 'what-if',
        loadComponent: () =>
          import('./features/educational/what-if-calculator/what-if-calculator.component').then(
            (m) => m.WhatIfCalculatorComponent
          ),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/educational/tax-calendar/tax-calendar.component').then(
            (m) => m.TaxCalendarComponent
          ),
      },
      {
        path: 'filing-helper',
        loadComponent: () =>
          import('./features/educational/filing-decision-helper/filing-decision-helper.component').then(
            (m) => m.FilingDecisionHelperComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'welcome' },
];
