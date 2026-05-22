export interface USState {
  value: string;
  label: string;
}

export interface StateTaxRate {
  [stateCode: string]: number;
}

export const stateTaxRates: StateTaxRate = {
  'AL': 0.04,  // Alabama
  'AK': 0.00,  // Alaska (no state sales tax)
  'AZ': 0.056, // Arizona
  'AR': 0.065, // Arkansas
  'CA': 0.0725, // California
  'CO': 0.029, // Colorado
  'CT': 0.0635, // Connecticut
  'DE': 0.00,  // Delaware (no state sales tax)
  'FL': 0.06,  // Florida
  'GA': 0.04,  // Georgia
  'HI': 0.04,  // Hawaii
  'ID': 0.06,  // Idaho
  'IL': 0.0625, // Illinois
  'IN': 0.07,  // Indiana
  'IA': 0.06,  // Iowa
  'KS': 0.065, // Kansas
  'KY': 0.06,  // Kentucky
  'LA': 0.0445, // Louisiana
  'ME': 0.055, // Maine
  'MD': 0.06,  // Maryland
  'MA': 0.0625, // Massachusetts
  'MI': 0.06,  // Michigan
  'MN': 0.06875, // Minnesota
  'MS': 0.07,  // Mississippi
  'MO': 0.04225, // Missouri
  'MT': 0.00,  // Montana (no state sales tax)
  'NE': 0.055, // Nebraska
  'NV': 0.0685, // Nevada
  'NH': 0.00,  // New Hampshire (no state sales tax)
  'NJ': 0.06625, // New Jersey
  'NM': 0.05125, // New Mexico
  'NY': 0.04,  // New York
  'NC': 0.0475, // North Carolina
  'ND': 0.05,  // North Dakota
  'OH': 0.0575, // Ohio
  'OK': 0.045, // Oklahoma
  'OR': 0.00,  // Oregon (no state sales tax)
  'PA': 0.06,  // Pennsylvania
  'RI': 0.07,  // Rhode Island
  'SC': 0.06,  // South Carolina
  'SD': 0.045, // South Dakota
  'TN': 0.07,  // Tennessee
  'TX': 0.0625, // Texas
  'UT': 0.0595, // Utah
  'VT': 0.06,  // Vermont
  'VA': 0.053, // Virginia
  'WA': 0.065, // Washington
  'WV': 0.06,  // West Virginia
  'WI': 0.05,  // Wisconsin
  'WY': 0.04   // Wyoming
};

export const usStates: USState[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];
