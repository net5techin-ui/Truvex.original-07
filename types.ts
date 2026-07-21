export interface CustomerDetails {
  name: string;
  mobile: string;
  location: string;
  address: string;
  customerId: string;
  reportId: string;
  date: string;
  time: string;
}

export interface VehicleDetails {
  bikeModel: string;
  originalPrice: number;
  bikeAge: number; // in years
  loanTenure: number; // in years
  ltvLimit: number; // percentage (80-90%)
  interestRate: number; // percentage
  financeCompany: string; // e.g., Shriram, Bajaj, etc. Purely informational or custom choice
  
  // New Car-specific fields
  vehicleType?: "Bike" | "Car";
  carBrand?: string;
  carModel?: string;
  manufacturingYear?: number;
  registrationYear?: number;
  fuelType?: string;
  transmission?: string;
  variant?: string;
  kilometersDriven?: number;
  ownerType?: string;
  insuranceStatus?: string;
}

export interface CalculationResults {
  marketValue: number;
  loanAmount: number;
  emi: number;
  calculated: boolean;
  vehicleAge: number;
  manufacturingYear: number;
  remainingPercentage: number;
  companyMaxLtv: number;
  monthlyInterestRate: number;
  loanMonths: number;
  totalRepayment: number;
  totalInterest: number;
  isEligible: boolean;
  approvalStatus: "Eligible" | "Not Eligible";
  eligibilityReason?: string;
  
  // New Car specific intermediate adjustments for results/PDF display
  depreciationPercent?: number;
  kmAdjustmentPercent?: number;
  ownerAdjustmentPercent?: number;
  insuranceAdjustmentPercent?: number;
}
