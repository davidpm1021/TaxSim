/**
 * State Tax Data for Tax Year 2025
 * Priority states implemented: CA, TX, FL, NY, PA, IL, OH, MI, NC, GA
 */

import { StateTaxInfo, StateCode } from '../models/state-tax.model';

/**
 * All US States with basic info
 */
export const ALL_STATES: { code: StateCode; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

/**
 * State Tax Information for Priority States (2025 Tax Year)
 * Note: Values are approximations based on 2024 data with inflation adjustments
 */
export const STATE_TAX_DATA: Record<string, StateTaxInfo> = {
  // California - Progressive tax with high brackets
  CA: {
    code: 'CA',
    name: 'California',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: {
      single: [
        { min: 0, max: 10412, rate: 0.01, baseTax: 0 },
        { min: 10412, max: 24684, rate: 0.02, baseTax: 104.12 },
        { min: 24684, max: 38959, rate: 0.04, baseTax: 389.56 },
        { min: 38959, max: 54081, rate: 0.06, baseTax: 960.56 },
        { min: 54081, max: 68350, rate: 0.08, baseTax: 1867.88 },
        { min: 68350, max: 349137, rate: 0.093, baseTax: 3009.40 },
        { min: 349137, max: 418961, rate: 0.103, baseTax: 29122.59 },
        { min: 418961, max: 698271, rate: 0.113, baseTax: 36315.46 },
        { min: 698271, max: Infinity, rate: 0.123, baseTax: 67877.50 },
      ],
      marriedFilingJointly: [
        { min: 0, max: 20824, rate: 0.01, baseTax: 0 },
        { min: 20824, max: 49368, rate: 0.02, baseTax: 208.24 },
        { min: 49368, max: 77918, rate: 0.04, baseTax: 779.12 },
        { min: 77918, max: 108162, rate: 0.06, baseTax: 1921.12 },
        { min: 108162, max: 136700, rate: 0.08, baseTax: 3735.76 },
        { min: 136700, max: 698274, rate: 0.093, baseTax: 6018.80 },
        { min: 698274, max: 837922, rate: 0.103, baseTax: 58245.17 },
        { min: 837922, max: 1396542, rate: 0.113, baseTax: 72630.91 },
        { min: 1396542, max: Infinity, rate: 0.123, baseTax: 135754.98 },
      ],
      marriedFilingSeparately: [
        { min: 0, max: 10412, rate: 0.01, baseTax: 0 },
        { min: 10412, max: 24684, rate: 0.02, baseTax: 104.12 },
        { min: 24684, max: 38959, rate: 0.04, baseTax: 389.56 },
        { min: 38959, max: 54081, rate: 0.06, baseTax: 960.56 },
        { min: 54081, max: 68350, rate: 0.08, baseTax: 1867.88 },
        { min: 68350, max: 349137, rate: 0.093, baseTax: 3009.40 },
        { min: 349137, max: 418961, rate: 0.103, baseTax: 29122.59 },
        { min: 418961, max: 698271, rate: 0.113, baseTax: 36315.46 },
        { min: 698271, max: Infinity, rate: 0.123, baseTax: 67877.50 },
      ],
      headOfHousehold: [
        { min: 0, max: 20839, rate: 0.01, baseTax: 0 },
        { min: 20839, max: 49371, rate: 0.02, baseTax: 208.39 },
        { min: 49371, max: 63644, rate: 0.04, baseTax: 779.03 },
        { min: 63644, max: 78765, rate: 0.06, baseTax: 1349.95 },
        { min: 78765, max: 93037, rate: 0.08, baseTax: 2257.21 },
        { min: 93037, max: 474824, rate: 0.093, baseTax: 3398.97 },
        { min: 474824, max: 569790, rate: 0.103, baseTax: 38905.16 },
        { min: 569790, max: 949649, rate: 0.113, baseTax: 48686.68 },
        { min: 949649, max: Infinity, rate: 0.123, baseTax: 91610.74 },
      ],
    },
    standardDeduction: {
      single: 5363,
      marriedFilingJointly: 10726,
      marriedFilingSeparately: 5363,
      headOfHousehold: 10726,
    },
    specialRules: [
      'Mental Health Services Tax: Additional 1% on income over $1 million',
      'No deduction for state income taxes paid',
    ],
  },

  // Texas - No state income tax
  TX: {
    code: 'TX',
    name: 'Texas',
    hasIncomeTax: false,
    taxType: 'none',
    specialRules: [
      'Texas has no state income tax',
      'Revenue comes primarily from sales tax and property tax',
    ],
  },

  // Florida - No state income tax
  FL: {
    code: 'FL',
    name: 'Florida',
    hasIncomeTax: false,
    taxType: 'none',
    specialRules: [
      'Florida has no state income tax',
      'Revenue comes primarily from sales tax and tourism taxes',
    ],
  },

  // New York - Progressive tax
  NY: {
    code: 'NY',
    name: 'New York',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: {
      single: [
        { min: 0, max: 8500, rate: 0.04, baseTax: 0 },
        { min: 8500, max: 11700, rate: 0.045, baseTax: 340 },
        { min: 11700, max: 13900, rate: 0.0525, baseTax: 484 },
        { min: 13900, max: 80650, rate: 0.055, baseTax: 600 },
        { min: 80650, max: 215400, rate: 0.06, baseTax: 4271 },
        { min: 215400, max: 1077550, rate: 0.0685, baseTax: 12356 },
        { min: 1077550, max: 5000000, rate: 0.0965, baseTax: 71413 },
        { min: 5000000, max: 25000000, rate: 0.103, baseTax: 449929 },
        { min: 25000000, max: Infinity, rate: 0.109, baseTax: 2509929 },
      ],
      marriedFilingJointly: [
        { min: 0, max: 17150, rate: 0.04, baseTax: 0 },
        { min: 17150, max: 23600, rate: 0.045, baseTax: 686 },
        { min: 23600, max: 27900, rate: 0.0525, baseTax: 976 },
        { min: 27900, max: 161550, rate: 0.055, baseTax: 1202 },
        { min: 161550, max: 323200, rate: 0.06, baseTax: 8553 },
        { min: 323200, max: 2155350, rate: 0.0685, baseTax: 18252 },
        { min: 2155350, max: 5000000, rate: 0.0965, baseTax: 143754 },
        { min: 5000000, max: 25000000, rate: 0.103, baseTax: 418263 },
        { min: 25000000, max: Infinity, rate: 0.109, baseTax: 2478263 },
      ],
      marriedFilingSeparately: [
        { min: 0, max: 8500, rate: 0.04, baseTax: 0 },
        { min: 8500, max: 11700, rate: 0.045, baseTax: 340 },
        { min: 11700, max: 13900, rate: 0.0525, baseTax: 484 },
        { min: 13900, max: 80650, rate: 0.055, baseTax: 600 },
        { min: 80650, max: 215400, rate: 0.06, baseTax: 4271 },
        { min: 215400, max: 1077550, rate: 0.0685, baseTax: 12356 },
        { min: 1077550, max: 5000000, rate: 0.0965, baseTax: 71413 },
        { min: 5000000, max: 25000000, rate: 0.103, baseTax: 449929 },
        { min: 25000000, max: Infinity, rate: 0.109, baseTax: 2509929 },
      ],
      headOfHousehold: [
        { min: 0, max: 12800, rate: 0.04, baseTax: 0 },
        { min: 12800, max: 17650, rate: 0.045, baseTax: 512 },
        { min: 17650, max: 20900, rate: 0.0525, baseTax: 730 },
        { min: 20900, max: 107650, rate: 0.055, baseTax: 901 },
        { min: 107650, max: 269300, rate: 0.06, baseTax: 5672 },
        { min: 269300, max: 1616450, rate: 0.0685, baseTax: 15371 },
        { min: 1616450, max: 5000000, rate: 0.0965, baseTax: 107661 },
        { min: 5000000, max: 25000000, rate: 0.103, baseTax: 434214 },
        { min: 25000000, max: Infinity, rate: 0.109, baseTax: 2494214 },
      ],
    },
    standardDeduction: {
      single: 8000,
      marriedFilingJointly: 16050,
      marriedFilingSeparately: 8000,
      headOfHousehold: 11200,
    },
    specialRules: [
      'NYC residents pay additional NYC income tax (3.078% - 3.876%)',
      'Yonkers residents pay Yonkers income tax surcharge',
    ],
  },

  // Pennsylvania - Flat tax
  PA: {
    code: 'PA',
    name: 'Pennsylvania',
    hasIncomeTax: true,
    taxType: 'flat',
    flatRate: 0.0307, // 3.07%
    specialRules: [
      'Pennsylvania has a flat income tax rate',
      'No standard deduction or personal exemption',
      'Most retirement income is exempt from PA tax',
      'Local earned income tax may also apply (typically 1-3%)',
    ],
  },

  // Illinois - Flat tax
  IL: {
    code: 'IL',
    name: 'Illinois',
    hasIncomeTax: true,
    taxType: 'flat',
    flatRate: 0.0495, // 4.95%
    personalExemption: {
      single: 2625,
      marriedFilingJointly: 5250,
      marriedFilingSeparately: 2625,
      headOfHousehold: 2625,
      dependent: 2625,
    },
    specialRules: [
      'Illinois has a flat income tax rate',
      'Personal exemption reduces taxable income',
      'Retirement income is generally exempt',
    ],
  },

  // Ohio - Progressive tax (simplified in 2023+)
  OH: {
    code: 'OH',
    name: 'Ohio',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: {
      single: [
        { min: 0, max: 26050, rate: 0, baseTax: 0 },
        { min: 26050, max: 100000, rate: 0.0275, baseTax: 0 },
        { min: 100000, max: Infinity, rate: 0.035, baseTax: 2033.63 },
      ],
      marriedFilingJointly: [
        { min: 0, max: 26050, rate: 0, baseTax: 0 },
        { min: 26050, max: 100000, rate: 0.0275, baseTax: 0 },
        { min: 100000, max: Infinity, rate: 0.035, baseTax: 2033.63 },
      ],
      marriedFilingSeparately: [
        { min: 0, max: 26050, rate: 0, baseTax: 0 },
        { min: 26050, max: 100000, rate: 0.0275, baseTax: 0 },
        { min: 100000, max: Infinity, rate: 0.035, baseTax: 2033.63 },
      ],
      headOfHousehold: [
        { min: 0, max: 26050, rate: 0, baseTax: 0 },
        { min: 26050, max: 100000, rate: 0.0275, baseTax: 0 },
        { min: 100000, max: Infinity, rate: 0.035, baseTax: 2033.63 },
      ],
    },
    specialRules: [
      'First $26,050 of income is exempt from state tax',
      'Ohio has local income taxes in many cities (typically 1-3%)',
      'School district income taxes may also apply',
    ],
  },

  // Michigan - Flat tax
  MI: {
    code: 'MI',
    name: 'Michigan',
    hasIncomeTax: true,
    taxType: 'flat',
    flatRate: 0.0425, // 4.25%
    personalExemption: {
      single: 5600,
      marriedFilingJointly: 11200,
      marriedFilingSeparately: 5600,
      headOfHousehold: 5600,
      dependent: 5600,
    },
    specialRules: [
      'Michigan has a flat income tax rate',
      'Personal exemption reduces taxable income',
      'Some cities have additional local income taxes (Detroit: 2.4%)',
    ],
  },

  // North Carolina - Flat tax
  NC: {
    code: 'NC',
    name: 'North Carolina',
    hasIncomeTax: true,
    taxType: 'flat',
    flatRate: 0.0475, // 4.75% for 2025
    standardDeduction: {
      single: 12750,
      marriedFilingJointly: 25500,
      marriedFilingSeparately: 12750,
      headOfHousehold: 19125,
    },
    specialRules: [
      'North Carolina has a flat income tax rate',
      'Standard deduction is available',
      'Rate has been decreasing (was 5.25% in 2023)',
    ],
  },

  // Georgia - Progressive tax (transitioning to flat)
  GA: {
    code: 'GA',
    name: 'Georgia',
    hasIncomeTax: true,
    taxType: 'progressive',
    brackets: {
      single: [
        { min: 0, max: 750, rate: 0.01, baseTax: 0 },
        { min: 750, max: 2250, rate: 0.02, baseTax: 7.50 },
        { min: 2250, max: 3750, rate: 0.03, baseTax: 37.50 },
        { min: 3750, max: 5250, rate: 0.04, baseTax: 82.50 },
        { min: 5250, max: 7000, rate: 0.05, baseTax: 142.50 },
        { min: 7000, max: Infinity, rate: 0.055, baseTax: 230.00 },
      ],
      marriedFilingJointly: [
        { min: 0, max: 1000, rate: 0.01, baseTax: 0 },
        { min: 1000, max: 3000, rate: 0.02, baseTax: 10 },
        { min: 3000, max: 5000, rate: 0.03, baseTax: 50 },
        { min: 5000, max: 7000, rate: 0.04, baseTax: 110 },
        { min: 7000, max: 10000, rate: 0.05, baseTax: 190 },
        { min: 10000, max: Infinity, rate: 0.055, baseTax: 340 },
      ],
      marriedFilingSeparately: [
        { min: 0, max: 500, rate: 0.01, baseTax: 0 },
        { min: 500, max: 1500, rate: 0.02, baseTax: 5 },
        { min: 1500, max: 2500, rate: 0.03, baseTax: 25 },
        { min: 2500, max: 3500, rate: 0.04, baseTax: 55 },
        { min: 3500, max: 5000, rate: 0.05, baseTax: 95 },
        { min: 5000, max: Infinity, rate: 0.055, baseTax: 170 },
      ],
      headOfHousehold: [
        { min: 0, max: 1000, rate: 0.01, baseTax: 0 },
        { min: 1000, max: 3000, rate: 0.02, baseTax: 10 },
        { min: 3000, max: 5000, rate: 0.03, baseTax: 50 },
        { min: 5000, max: 7000, rate: 0.04, baseTax: 110 },
        { min: 7000, max: 10000, rate: 0.05, baseTax: 190 },
        { min: 10000, max: Infinity, rate: 0.055, baseTax: 340 },
      ],
    },
    standardDeduction: {
      single: 5400,
      marriedFilingJointly: 7100,
      marriedFilingSeparately: 3550,
      headOfHousehold: 7100,
    },
    personalExemption: {
      single: 2700,
      marriedFilingJointly: 7400,
      marriedFilingSeparately: 3700,
      headOfHousehold: 2700,
      dependent: 3000,
    },
    specialRules: [
      'Georgia is transitioning to a flat tax rate',
      'Both standard deduction and personal exemptions available',
    ],
  },
};

/**
 * Get state tax info by state code
 */
export function getStateTaxInfo(stateCode: StateCode): StateTaxInfo | null {
  return STATE_TAX_DATA[stateCode] || null;
}

/**
 * Get state name by code
 */
export function getStateName(stateCode: StateCode): string {
  const state = ALL_STATES.find((s) => s.code === stateCode);
  return state?.name || stateCode;
}

/**
 * Check if state has income tax
 */
export function stateHasIncomeTax(stateCode: StateCode): boolean {
  const info = STATE_TAX_DATA[stateCode];
  return info?.hasIncomeTax ?? true; // Assume has tax if not in our data
}

/**
 * Check if state is fully implemented
 */
export function isStateImplemented(stateCode: StateCode): boolean {
  return stateCode in STATE_TAX_DATA;
}
