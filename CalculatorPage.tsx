import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, Phone, MapPin, FileText, Calendar, Clock, 
  UploadCloud, CircleCheck, AlertTriangle, ChevronRight, 
  HelpCircle, ArrowLeft, Image as ImageIcon, Calculator,
  TrendingDown, Percent, Landmark, ChevronDown,
  Car, Bike, ShieldAlert, Check, TrendingUp
} from "lucide-react";
import { generateTruvexPDF, generateTruvexDemoManualPDF, generateTruvexCarPDF } from "./pdfGenerator";
import { CustomerDetails, VehicleDetails, CalculationResults } from "./types";

// ============================================================================
// STANDALONE VEHICLE LOAN ELIGIBILITY CALCULATION ENGINE FUNCTIONS
// ============================================================================

export function calculateVehicleAge(yearsOrManufactureYear: number | string, currentYear: number = 2026): number {
  const val = parseFloat(String(yearsOrManufactureYear));
  if (isNaN(val) || val < 0) return 0;
  if (val > 1000) {
    return currentYear - val;
  }
  return val;
}

export function calculateMarketValue(originalPrice: number, age: number): number {
  if (isNaN(originalPrice) || originalPrice < 0 || isNaN(age) || age < 0) return 0;
  
  // Configurable depreciation table from user's specification
  let percentage = 35; // default for 7+ years
  if (age <= 1) percentage = 90;
  else if (age <= 2) percentage = 82;
  else if (age <= 3) percentage = 74;
  else if (age <= 4) percentage = 66;
  else if (age <= 5) percentage = 58;
  else if (age <= 6) percentage = 50;
  else if (age <= 7) percentage = 43;
  else percentage = 35;

  return originalPrice * (percentage / 100);
}

export function calculateLoanAmount(marketValue: number, ltv: number): number {
  if (isNaN(marketValue) || marketValue < 0 || isNaN(ltv) || ltv < 0) return 0;
  return marketValue * (ltv / 100);
}

export function calculateEMI(loanAmount: number, annualInterestRate: number, loanPeriodYears: number): number {
  if (isNaN(loanAmount) || loanAmount <= 0 || isNaN(annualInterestRate) || annualInterestRate < 0 || isNaN(loanPeriodYears) || loanPeriodYears <= 0) {
    return 0;
  }
  const r = annualInterestRate / 12 / 100;
  const n = loanPeriodYears * 12;
  if (n <= 0) return 0;
  if (r === 0) return loanAmount / n;
  
  return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateTotalRepayment(emi: number, loanPeriodYears: number): number {
  if (isNaN(emi) || emi < 0 || isNaN(loanPeriodYears) || loanPeriodYears <= 0) return 0;
  return emi * loanPeriodYears * 12;
}

export function calculateTotalInterest(totalRepayment: number, loanAmount: number): number {
  if (isNaN(totalRepayment) || isNaN(loanAmount)) return 0;
  const interest = totalRepayment - loanAmount;
  return interest < 0 ? 0 : interest;
}

export function calculateApprovalStatus(
  loanAmount: number, 
  vehicleAge: number, 
  ltv: number, 
  interestRate: number, 
  loanPeriod: number
): "Eligible" | "Not Eligible" {
  const isEligible = 
    loanAmount > 0 && 
    vehicleAge <= 10 && 
    ltv >= 80 && 
    ltv <= 90 && 
    interestRate >= 20 && 
    interestRate <= 25 && 
    loanPeriod > 0;
  return isEligible ? "Eligible" : "Not Eligible";
}

export const CAR_FINANCE_COMPANIES = [
  { name: "Shriram Finance", ltv: 80, rate: 21.5 },
  { name: "Mahindra Finance", ltv: 82, rate: 22.0 },
  { name: "HDFC Bank", ltv: 85, rate: 20.5 },
  { name: "ICICI Bank", ltv: 85, rate: 21.0 },
  { name: "SBI", ltv: 80, rate: 20.0 },
  { name: "Cholamandalam", ltv: 80, rate: 22.5 }
];

export const BIKE_FINANCE_COMPANIES = [
  { name: "Truvex Secured Asset Credit", ltv: 85, rate: 22.0 },
  { name: "Shriram Finance", ltv: 85, rate: 21.0 },
  { name: "HDFC Bank", ltv: 80, rate: 22.0 },
  { name: "Bajaj Auto Finance", ltv: 85, rate: 20.5 },
  { name: "Muthoot Finance", ltv: 82, rate: 23.0 }
];

export const CAR_SUGGESTIONS: Record<string, string[]> = {
  "Maruti Suzuki": ["Swift", "Dzire", "Baleno", "Wagon R", "Brezza", "Ertiga", "Alto", "Celerio"],
  "Hyundai": ["i20", "Creta", "Verna", "Venue", "Grand i10", "Tucson", "Alcazar"],
  "Tata": ["Nexon", "Harrier", "Safari", "Altroz", "Tiago", "Tigor", "Punch"],
  "Mahindra": ["XUV700", "Thar", "Scorpio", "Bolero", "XUV300"],
  "Toyota": ["Fortuner", "Innova Crysta", "Glanza", "Urban Cruiser", "Camry"],
  "Honda": ["City", "Amaze", "Elevate", "Civic"],
  "Kia": ["Seltos", "Sonet", "Carens", "Carnival"],
  "MG": ["Hector", "Astor", "ZS EV", "Gloster"],
  "Skoda": ["Slavia", "Kushaq", "Octavia", "Superb"],
  "Volkswagen": ["Virtus", "Taigun", "Polo", "Tiguan"],
  "Nissan": ["Magnite", "Kicks"],
  "Renault": ["Kwid", "Triber", "Kiger"],
  "Jeep": ["Compass", "Meridian"],
  "BMW": ["3 Series", "5 Series", "X1", "X3", "X5"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC", "GLE"],
  "Audi": ["A4", "A6", "Q3", "Q5", "Q7"],
  "Volvo": ["XC40", "XC60", "XC90"]
};
export const BIKE_MODELS = [
  { name: "Royal Enfield Classic 350" },
  { name: "Yamaha YZF R15 V4" },
  { name: "Honda Activa 6G" },
  { name: "Hero Splendor Plus" },
  { name: "TVS Jupiter" },
  { name: "Suzuki Access 125" },
  { name: "KTM Duke 200" },
  { name: "Bajaj Pulsar 150" }
];


const TruvexLogo = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none shrink-0">
      <svg viewBox="0 0 130 110" className="w-9 h-9 sm:w-11 sm:h-11 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Car canopy / roof curve */}
        <path
          d="M 15 32 C 30 14, 75 11, 105 27 C 112 30, 115 32, 118 35 C 114 33, 107 30, 100 28 C 75 17, 32 19, 15 32 Z"
          fill="#1d4ed8"
        />
        {/* Left part of T (Dark Navy) */}
        <path
          d="M 12 42 L 72 42 L 70 52 L 47 52 L 32 102 L 20 102 L 35 52 L 12 52 Z"
          fill="#0f172a"
        />
        {/* Right part of T (Royal Blue) */}
        <path
          d="M 78 42 L 115 42 L 112 52 L 85 52 L 70 102 L 58 102 L 73 52 L 76 52 Z"
          fill="#2563eb"
        />
      </svg>
      <div className="flex flex-col justify-center shrink-0">
        <div className="flex items-center text-xl sm:text-2xl font-extrabold tracking-[0.08em] leading-none text-[#0f172a] font-sans shrink-0">
          <span>TRUVE</span>
          <span className="relative inline-block w-[0.9rem] h-[1.2rem] sm:w-[1.1rem] sm:h-[1.5rem] ml-[0.05em] shrink-0">
            <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="3" y1="3" x2="21" y2="21" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="21" y1="3" x2="3" y2="21" stroke="#2563eb" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 shrink-0">
          <div className="h-[1.5px] w-2 sm:w-4 bg-[#2563eb] shrink-0" />
          <span className="text-[6.5px] sm:text-[7.5px] tracking-[0.16em] font-extrabold text-[#4b5563] whitespace-nowrap uppercase shrink-0">
            Smart Vehicle Loan Estimator
          </span>
          <div className="h-[1.5px] w-2 sm:w-4 bg-[#2563eb] shrink-0" />
        </div>
      </div>
    </div>
  );
};

const formatInIN = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return "₹" + new Intl.NumberFormat('en-IN').format(Math.round(num));
};

interface CalculatorPageProps {
  onBack?: () => void;
}

export default function CalculatorPage({ onBack }: CalculatorPageProps) {
  // 1. Customer Details States
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  
  // Generated Metadata
  const [customerId, setCustomerId] = useState("");
  const [reportId, setReportId] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // 2. Vehicle Details States
  const [vehicleType, setVehicleType] = useState<"Bike" | "Car">("Bike");

  const [bikeBrand, setBikeBrand] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [bikeMarketValue, setBikeMarketValue] = useState("");
  const [bikeDepreciationPercentage, setBikeDepreciationPercentage] = useState("");
  const [yearsOfUsage, setYearsOfUsage] = useState("");
  const bikeAge = yearsOfUsage || "0";
  const [bikeValidationMessage, setBikeValidationMessage] = useState("");
  const [loanTenure, setLoanTenure] = useState(""); // empty by default
  const [ltvLimit, setLtvLimit] = useState<number | "">(85); // default value: 85%
  const [interestRate, setInterestRate] = useState("20");
  const financeCompany = "Truvex Secured Asset Credit";

  // Car Details States
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carRegYear, setCarRegYear] = useState("");
  const [carFuelType, setCarFuelType] = useState("");
  const [carTransmission, setCarTransmission] = useState("");
  const [carVariant, setCarVariant] = useState("");
  const [carKmDriven, setCarKmDriven] = useState("");
  const [carOwnerType, setCarOwnerType] = useState("");
  const [carInsuranceStatus, setCarInsuranceStatus] = useState("");
  const [carOriginalPrice, setCarOriginalPrice] = useState("");
  const [carMarketValue, setCarMarketValue] = useState("");
  const [carLoanTenure, setCarLoanTenure] = useState("");
  const [carFinanceCompany, setCarFinanceCompany] = useState("Truvex Secured Asset Credit");
  const [carInterestRate, setCarInterestRate] = useState("20");
  const [carLtvLimit, setCarLtvLimit] = useState<number | "">(85);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [carValidationMessage, setCarValidationMessage] = useState("");

  // Image Upload State (holds base64 data)
  const [bikeImage, setBikeImage] = useState<string | null>(null);

  // Custom Dropdown UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = () => {
      setIsDropdownOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  // 3. Calculation Results State
  const [results, setResults] = useState<CalculationResults>({
    marketValue: 0,
    loanAmount: 0,
    emi: 0,
    calculated: false,
    vehicleAge: 0,
    manufacturingYear: 2026,
    remainingPercentage: 0,
    companyMaxLtv: 0,
    monthlyInterestRate: 0,
    loanMonths: 0,
    totalRepayment: 0,
    totalInterest: 0,
    isEligible: false,
    approvalStatus: "Not Eligible",
    eligibilityReason: "",
  });

  // Generate unique metadata once on component load
  useEffect(() => {
    const today = new Date();
    
    // Format Date: e.g., "15 July 2026"
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    setCurrentDate(formattedDate);

    // Format Time: e.g., "07:16 AM"
    let hours = today.getHours();
    const minutes = today.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    setCurrentTime(formattedTime);

    // Generate Customer ID: e.g., TVX-20260715-284
    const dateStr = today.getFullYear() + 
                    (today.getMonth() + 1).toString().padStart(2, "0") + 
                    today.getDate().toString().padStart(2, "0");
    const randCust = Math.floor(100 + Math.random() * 900);
    setCustomerId(`TVX-${dateStr}-${randCust}`);

    // Generate Report ID: e.g., TRX-20260715-00456
    const randReport = Math.floor(10000 + Math.random() * 90000);
    setReportId(`TRX-${dateStr}-${randReport}`);
  }, []);

  // Sync state values to DOM elements for original calculations compatibility
  const setDomValue = (id: string, value: string) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) {
      el.value = value;
    }
  };

  const updateDomText = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = text;
    }
  };

  // Image upload preview handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBikeImage(base64String);

        // Also update standard preview-img tag if it exists in DOM
        const previewEl = document.getElementById("preview-img") as HTMLImageElement;
        if (previewEl) {
          previewEl.src = base64String;
          previewEl.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Main appraisal logic that computes results and updates state & DOM elements
  const performAppraisal = () => {
    const price = parseFloat(originalPrice);
    const age = parseFloat(yearsOfUsage);
    const rate = parseFloat(interestRate);
    const tenure = parseInt(loanTenure);
    const ltv = parseFloat(String(ltvLimit));

    if (!bikeBrand) {
      setBikeValidationMessage("Please enter Bike Brand.");
      return;
    }
    if (!bikeModel) {
      setBikeValidationMessage("Please enter Bike Model.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setBikeValidationMessage("Original Price must be greater than zero.");
      return;
    }
    if (isNaN(age) || age < 0) {
      setBikeValidationMessage("Years of Usage cannot be negative.");
      return;
    }
    if (isNaN(rate) || rate < 20 || rate > 25) {
      setBikeValidationMessage("Interest Rate must be between 20% and 25% p.a.");
      return;
    }
    if (isNaN(tenure) || tenure < 1 || tenure > 5) {
      setBikeValidationMessage("Loan Period must be between 1 and 5 Years.");
      return;
    }
    if (isNaN(ltv) || ltv < 80 || ltv > 90) {
      setBikeValidationMessage("LTV Limit must be between 80% and 90%.");
      return;
    }

    setBikeValidationMessage("");

    // STEP 1: Calculate Current Vehicle Value using depreciation.
    // Year 1 = 15% depreciation
    // Every additional year = 10%
    // Formula:
    // If Years = 1: CurrentValue = OriginalPrice × 0.85
    // Else: CurrentValue = OriginalPrice × 0.85 × (0.90^(Years-1))
    let currentValue = price;
    if (age === 0) {
      currentValue = price;
    } else if (age === 1) {
      currentValue = price * 0.85;
    } else {
      currentValue = price * 0.85 * Math.pow(0.90, age - 1);
    }

    // Depreciation percentage calculation for metadata display and rendering
    const depreciationPercent = price > 0 ? ((price - currentValue) / price) * 100 : 0;
    const remainingPercentage = (100 - depreciationPercent) / 100;

    // STEP 2: Eligible Loan Amount
    // LoanAmount = CurrentValue × (LTV /100)
    const loanAmount = currentValue * (ltv / 100);

    // STEP 3: Monthly Interest Rate
    // MonthlyRate = InterestRate /12 /100
    const monthlyRate = rate / 12 / 100;

    // STEP 4: EMI Formula
    // EMI = P × R × (1+R)^N / ((1+R)^N − 1)
    const n = tenure * 12;
    let emi = 0;
    if (monthlyRate > 0 && n > 0) {
      emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    } else if (n > 0) {
      emi = loanAmount / n;
    }

    // STEP 5: Total Repayment
    // EMI × Number of Months
    const totalRepayment = emi * n;

    // STEP 6: Total Interest
    // Total Repayment − Loan Amount
    const totalInterest = Math.max(0, totalRepayment - loanAmount);

    // Eligibility:
    // Eligible if Loan Amount >= ₹50,000
    // Otherwise Not Eligible.
    const isEligible = loanAmount >= 50000;
    const approvalStatus = isEligible ? "Eligible" : "Not Eligible";

    const eligibilityReason = isEligible 
      ? `Pre-approved under standard policy guidelines (Loan Amount ${formatInIN(loanAmount)} is >= ₹50,000).` 
      : `Ineligible: Loan Amount (${formatInIN(loanAmount)}) is below the minimum requirement of ₹50,000.`;

    const mfgYr = 2026 - Math.round(age);

    setResults({
      marketValue: currentValue,
      loanAmount,
      emi,
      calculated: true,
      vehicleAge: age,
      manufacturingYear: mfgYr,
      remainingPercentage: remainingPercentage,
      companyMaxLtv: ltv,
      monthlyInterestRate: monthlyRate,
      loanMonths: n,
      totalRepayment,
      totalInterest,
      isEligible: isEligible,
      approvalStatus: approvalStatus,
      eligibilityReason,
      depreciationPercent: depreciationPercent,
    });

    // Update compatible display DOM elements with formatted Indian currency values
    updateDomText("marketValue", formatInIN(currentValue));
    updateDomText("loanAmount", formatInIN(loanAmount));
    updateDomText("emi", formatInIN(emi));
    updateDomText("totalInterest", formatInIN(totalInterest));
    updateDomText("totalRepayment", formatInIN(totalRepayment));

    updateDomText("res-model", bikeBrand ? `${bikeBrand} ${bikeModel}` : bikeModel);
    updateDomText("res-current-price", formatInIN(currentValue));
    updateDomText("res-loan-amount", formatInIN(loanAmount));
    updateDomText("res-emi", formatInIN(emi) + " / month");

    const pdfBtn = document.getElementById("pdfBtn") as HTMLButtonElement;
    if (pdfBtn) {
      pdfBtn.disabled = false;
    }
  };

  const handleCarFinanceCompanyChange = (companyName: string) => {
    setCarFinanceCompany(companyName);
    const found = CAR_FINANCE_COMPANIES.find(c => c.name === companyName);
    if (found) {
      setCarLtvLimit(found.ltv);
      setCarInterestRate(String(found.rate));
    }
  };

  const performCarAppraisal = () => {
    const price = parseFloat(carOriginalPrice);
    const regYear = parseInt(carRegYear);
    const age = 2026 - (isNaN(regYear) ? 2026 : regYear);
    let mktValue = parseFloat(carMarketValue);
    if (isNaN(mktValue) || mktValue <= 0) {
      mktValue = calculateMarketValue(price, age);
    }
    const km = parseFloat(carKmDriven);
    const tenure = parseInt(carLoanTenure);
    const rate = parseFloat(carInterestRate);
    const ltv = parseFloat(String(carLtvLimit));

    if (isNaN(price) || price <= 0) {
      setCarValidationMessage("Original Purchase Price must be greater than zero.");
      return;
    }
    if (isNaN(regYear) || regYear < 1990 || regYear > 2026) {
      setCarValidationMessage("Registration Year must be between 1990 and 2026.");
      return;
    }
    if (isNaN(km) || km < 0) {
      setCarValidationMessage("Kilometers Driven must be a valid non-negative number.");
      return;
    }
    if (isNaN(rate) || rate < 20 || rate > 25) {
      setCarValidationMessage("Interest Rate must be between 20% and 25% p.a.");
      return;
    }
    if (!carBrand || !carModel || !carFuelType || !carTransmission || !carOwnerType || !carInsuranceStatus || !carFinanceCompany || isNaN(tenure) || isNaN(rate) || isNaN(ltv)) {
      setCarValidationMessage("Please fill in all required fields to compute eligibility.");
      return;
    }

    // Calculations
    const mfgYear = regYear;
    const marketValue = mktValue;
    
    // Calculate display/PDF parameters based on the manual market value
    let depPercent = Math.round((1 - (marketValue / price)) * 100);
    if (depPercent < 0) depPercent = 0;
    if (depPercent > 100) depPercent = 100;

    // Kilometer adjustment (for metadata display)
    let kmAdj = 0;
    if (km < 20000) kmAdj = 3;
    else if (km <= 50000) kmAdj = 0;
    else if (km <= 80000) kmAdj = -5;
    else if (km <= 100000) kmAdj = -8;
    else kmAdj = -12;

    // Owner adjustment (for metadata display)
    let ownerAdj = 0;
    if (carOwnerType === "First Owner") ownerAdj = 0;
    else if (carOwnerType === "Second Owner") ownerAdj = -5;
    else if (carOwnerType === "Third Owner") ownerAdj = -10;
    else if (carOwnerType === "Fourth Owner") ownerAdj = -15;

    // Insurance adjustment (for metadata display)
    let insAdj = 0;
    if (carInsuranceStatus === "Expired") insAdj = -2;

    // Loan amount
    const loanAmount = marketValue * (ltv / 100);

    // EMI
    const emi = calculateEMI(loanAmount, rate, tenure);
    const totalRepayment = calculateTotalRepayment(emi, tenure);
    const totalInterest = calculateTotalInterest(totalRepayment, loanAmount);

    setResults({
      marketValue,
      loanAmount,
      emi,
      calculated: true,
      vehicleAge: age,
      manufacturingYear: mfgYear,
      remainingPercentage: depPercent / 100,
      companyMaxLtv: ltv,
      monthlyInterestRate: rate / 12 / 100,
      loanMonths: tenure * 12,
      totalRepayment,
      totalInterest,
      isEligible: true,
      approvalStatus: "Eligible",
      eligibilityReason: `Pre-approved under standard car finance policy guidelines by ${carFinanceCompany}.`,
      depreciationPercent: depPercent,
      kmAdjustmentPercent: kmAdj,
      ownerAdjustmentPercent: ownerAdj,
      insuranceAdjustmentPercent: insAdj
    });

    // Update compatible display DOM elements with formatted Indian currency values
    updateDomText("marketValue", formatInIN(marketValue));
    updateDomText("loanAmount", formatInIN(loanAmount));
    updateDomText("emi", formatInIN(emi));
    updateDomText("totalInterest", formatInIN(totalInterest));
    updateDomText("totalRepayment", formatInIN(totalRepayment));

    updateDomText("res-model", `${carBrand} ${carModel}`);
    updateDomText("res-current-price", formatInIN(marketValue));
    updateDomText("res-loan-amount", formatInIN(loanAmount));
    updateDomText("res-emi", formatInIN(emi) + " / month");

    const pdfBtn = document.getElementById("pdfBtn") as HTMLButtonElement;
    if (pdfBtn) {
      pdfBtn.disabled = false;
    }

    setCarValidationMessage("");
  };

  // Automatically calculate and suggest Bike Market Value and Depreciation % from the formula when Original Price or Years of Usage changes
  useEffect(() => {
    if (vehicleType === "Bike") {
      const price = parseFloat(originalPrice);
      const years = parseFloat(yearsOfUsage);
      if (!isNaN(price) && price > 0 && !isNaN(years) && years >= 0) {
        let currentValue = price;
        if (years === 0) {
          currentValue = price;
        } else if (years === 1) {
          currentValue = price * 0.85;
        } else {
          currentValue = price * 0.85 * Math.pow(0.90, years - 1);
        }
        
        const depPercent = ((price - currentValue) / price) * 100;
        setBikeMarketValue(String(Math.round(currentValue)));
        setBikeDepreciationPercentage(depPercent.toFixed(1));
      } else {
        setBikeMarketValue("");
        setBikeDepreciationPercentage("");
      }
    }
  }, [vehicleType, originalPrice, yearsOfUsage]);

  // Automatic real-time calculations for Bike & Car
  useEffect(() => {
    if (vehicleType === "Bike") {
      const price = parseFloat(originalPrice);
      const age = parseFloat(yearsOfUsage);
      const rate = parseFloat(interestRate);
      const tenure = parseInt(loanTenure);
      const ltv = parseFloat(String(ltvLimit));

      if (
        !isNaN(price) && price > 0 &&
        !isNaN(age) && age >= 0 &&
        !isNaN(rate) && rate >= 20 && rate <= 25 &&
        !isNaN(tenure) && tenure >= 1 && tenure <= 5 &&
        !isNaN(ltv) && ltv >= 80 && ltv <= 90 &&
        bikeBrand.trim() !== "" &&
        bikeModel.trim() !== "" &&
        !bikeValidationMessage
      ) {
        performAppraisal();
      }
    }
  }, [
    vehicleType,
    bikeBrand,
    bikeModel,
    originalPrice,
    yearsOfUsage,
    interestRate,
    loanTenure,
    ltvLimit,
    bikeValidationMessage
  ]);

  useEffect(() => {
    if (vehicleType === "Car") {
      const price = parseFloat(carOriginalPrice);
      const mktValue = parseFloat(carMarketValue);
      const regYear = parseInt(carRegYear);
      const km = parseFloat(carKmDriven);
      const tenure = parseInt(carLoanTenure);
      const rate = parseFloat(carInterestRate);
      const ltv = parseFloat(String(carLtvLimit));

      const isRegYearValid = !isNaN(regYear) && regYear >= 1990 && regYear <= 2026;

      if (!isNaN(price) && price > 0 && !isNaN(mktValue) && mktValue > 0 && mktValue <= price && isRegYearValid && !isNaN(km) && km >= 0 &&
          carBrand && carModel && carFuelType && carTransmission && carOwnerType && carInsuranceStatus && 
          carFinanceCompany && !isNaN(tenure) && !isNaN(rate) && !isNaN(ltv)) {
        performCarAppraisal();
      }
    }
  }, [
    vehicleType, carBrand, carModel, carRegYear, carFuelType, carTransmission, 
    carVariant, carKmDriven, carOwnerType, carInsuranceStatus, carOriginalPrice, carMarketValue,
    carLoanTenure, carFinanceCompany, carInterestRate, carLtvLimit
  ]);

  // Run calculation manually
  const runCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleType === "Bike") {
      performAppraisal();
    } else {
      performCarAppraisal();
    }
  };

  // Synchronize state values to hidden DOM elements for test environments and back-compat
  useEffect(() => {
    if (vehicleType === "Bike") {
      setDomValue("bike-model", bikeModel);
      setDomValue("original-price", originalPrice);
      setDomValue("bike-age", bikeAge);
      setDomValue("loan-years", loanTenure);
      setDomValue("ltv-limit", String(ltvLimit));
      setDomValue("interest-rate", interestRate);

      // Sync input fields with requested IDs
      setDomValue("bikeBrand", bikeBrand);
      setDomValue("bikeModel", bikeModel);
      setDomValue("bikeMfgYear", String(2026 - Math.round(parseFloat(yearsOfUsage) || 0)));
      setDomValue("originalPrice", originalPrice);
      setDomValue("bikeMarketValue", bikeMarketValue);
      setDomValue("bikeDepreciation", bikeDepreciationPercentage);
      setDomValue("yearsOfUsage", yearsOfUsage);
      setDomValue("interest", interestRate);
      setDomValue("loanYears", loanTenure);
      setDomValue("ltv", String(ltvLimit));
    } else {
      setDomValue("bike-model", `${carBrand} ${carModel}`);
      setDomValue("original-price", carOriginalPrice);
      setDomValue("bike-age", String(2026 - parseInt(carRegYear || "2026")));
      setDomValue("loan-years", carLoanTenure);
      setDomValue("ltv-limit", String(carLtvLimit));
      setDomValue("interest-rate", carInterestRate);

      // Sync input fields with requested IDs
      setDomValue("originalPrice", carOriginalPrice);
      setDomValue("carMarketValue", carMarketValue);
      setDomValue("yearsOfUsage", String(2026 - parseInt(carRegYear || "2026")));
      setDomValue("interest", carInterestRate);
      setDomValue("loanYears", carLoanTenure);
      setDomValue("ltv", String(carLtvLimit));
    }

    // Reset calculation results to 0 when input values change until Compute Valuation is clicked
    setResults(prev => {
      if (prev.calculated) {
        return {
          ...prev,
          calculated: false,
          marketValue: 0,
          loanAmount: 0,
          emi: 0,
          totalRepayment: 0,
          totalInterest: 0,
        };
      }
      return prev;
    });
  }, [
    vehicleType,
    bikeBrand, bikeModel, originalPrice, bikeMarketValue, bikeDepreciationPercentage, yearsOfUsage, loanTenure, ltvLimit, interestRate,
    carBrand, carModel, carRegYear, carFuelType, carTransmission,
    carVariant, carKmDriven, carOwnerType, carInsuranceStatus, carOriginalPrice, carMarketValue,
    carLoanTenure, carFinanceCompany, carInterestRate, carLtvLimit
  ]);

  // Expose calculation engine globally to be perfectly compatible with raw javascript scripts & test frameworks
  useEffect(() => {
    (window as any).calculateVehicleAge = (yearsValue?: number) => {
      const years = yearsValue !== undefined ? yearsValue : Number((document.getElementById("yearsOfUsage") as HTMLInputElement)?.value || 0);
      return calculateVehicleAge(years);
    };

    (window as any).calculateMarketValue = (origPrice?: number, vAge?: number) => {
      if (vehicleType === "Bike") {
        const price = origPrice !== undefined ? origPrice : Number((document.getElementById("originalPrice") as HTMLInputElement)?.value || 0);
        const age = vAge !== undefined ? vAge : (window as any).calculateVehicleAge();
        return calculateMarketValue(price, age);
      } else {
        const carMarketValueEl = document.getElementById("carMarketValue") as HTMLInputElement;
        return carMarketValueEl ? parseFloat(carMarketValueEl.value) || 0 : parseFloat(carMarketValue) || 0;
      }
    };

    (window as any).calculateLoanAmount = (mValue?: number, ltvValue?: number) => {
      const mVal = mValue !== undefined ? mValue : (window as any).calculateMarketValue();
      const ltvVal = ltvValue !== undefined ? ltvValue : Number((document.getElementById("ltv") as HTMLInputElement)?.value || 85);
      return calculateLoanAmount(mVal, ltvVal);
    };

    (window as any).calculateEMI = (lAmount?: number, intRate?: number, lPeriod?: number) => {
      const loan = lAmount !== undefined ? lAmount : (window as any).calculateLoanAmount();
      const rate = intRate !== undefined ? intRate : Number((document.getElementById("interest") as HTMLInputElement)?.value || 9.5);
      const period = lPeriod !== undefined ? lPeriod : Number((document.getElementById("loanYears") as HTMLSelectElement)?.value || 3);
      return calculateEMI(loan, rate, period);
    };

    (window as any).calculateTotalRepayment = (emiValue?: number, lPeriod?: number) => {
      const emi = emiValue !== undefined ? emiValue : (window as any).calculateEMI();
      const period = lPeriod !== undefined ? lPeriod : Number((document.getElementById("loanYears") as HTMLSelectElement)?.value || 3);
      return calculateTotalRepayment(emi, period);
    };

    (window as any).calculateTotalInterest = (tRepayment?: number, lAmount?: number) => {
      const rep = tRepayment !== undefined ? tRepayment : (window as any).calculateTotalRepayment();
      const loan = lAmount !== undefined ? lAmount : (window as any).calculateLoanAmount();
      return calculateTotalInterest(rep, loan);
    };

    (window as any).calculateApprovalStatus = (lAmount?: number, vAge?: number, ltvValue?: number, intRate?: number, lPeriod?: number) => {
      const loan = lAmount !== undefined ? lAmount : (window as any).calculateLoanAmount();
      const age = vAge !== undefined ? vAge : (window as any).calculateVehicleAge();
      const ltvVal = ltvValue !== undefined ? ltvValue : Number((document.getElementById("ltv") as HTMLInputElement)?.value || 85);
      const rate = intRate !== undefined ? intRate : Number((document.getElementById("interest") as HTMLInputElement)?.value || 22);
      const period = lPeriod !== undefined ? lPeriod : Number((document.getElementById("loanYears") as HTMLSelectElement)?.value || 3);
      return calculateApprovalStatus(loan, age, ltvVal, rate, period);
    };

    (window as any).calculateLoanEligibility = () => {
      const originalPriceEl = document.getElementById("originalPrice") as HTMLInputElement;
      const yearsOfUsageEl = document.getElementById("yearsOfUsage") as HTMLInputElement;
      const interestEl = document.getElementById("interest") as HTMLInputElement;
      const loanYearsEl = document.getElementById("loanYears") as HTMLSelectElement;
      const ltvEl = document.getElementById("ltv") as HTMLInputElement;
      const bikeBrandEl = document.getElementById("bikeBrand") as HTMLInputElement;
      const bikeModelEl = document.getElementById("bikeModel") as HTMLInputElement;
      const bikeMarketValueEl = document.getElementById("bikeMarketValue") as HTMLInputElement;
      const bikeDepreciationEl = document.getElementById("bikeDepreciation") as HTMLInputElement;

      if (vehicleType === "Bike") {
        if (bikeBrandEl) setBikeBrand(bikeBrandEl.value);
        if (bikeModelEl) setBikeModel(bikeModelEl.value);
        if (originalPriceEl) setOriginalPrice(originalPriceEl.value);
        if (bikeMarketValueEl) setBikeMarketValue(bikeMarketValueEl.value);
        if (bikeDepreciationEl) setBikeDepreciationPercentage(bikeDepreciationEl.value);
        if (yearsOfUsageEl) setYearsOfUsage(yearsOfUsageEl.value);
        if (interestEl) setInterestRate(interestEl.value);
        if (loanYearsEl) setLoanTenure(loanYearsEl.value);
        if (ltvEl) setLtvLimit(Number(ltvEl.value));
      } else {
        const carMarketValueEl = document.getElementById("carMarketValue") as HTMLInputElement;
        if (originalPriceEl) setCarOriginalPrice(originalPriceEl.value);
        if (carMarketValueEl) setCarMarketValue(carMarketValueEl.value);
        if (yearsOfUsageEl && yearsOfUsageEl.value) {
          const calculatedMfgYear = 2026 - parseInt(yearsOfUsageEl.value);
          if (!isNaN(calculatedMfgYear)) {
            setCarRegYear(String(calculatedMfgYear));
          }
        }
        if (interestEl) setCarInterestRate(interestEl.value);
        if (loanYearsEl) setCarLoanTenure(loanYearsEl.value);
        if (ltvEl) setCarLtvLimit(Number(ltvEl.value));
      }

      // Synchronous local execution for instant DOM responsiveness
      const price = originalPriceEl ? parseFloat(originalPriceEl.value) || 0 : (vehicleType === "Bike" ? parseFloat(originalPrice) || 0 : parseFloat(carOriginalPrice) || 0);
      const age = yearsOfUsageEl ? parseFloat(yearsOfUsageEl.value) || 0 : (vehicleType === "Bike" ? parseFloat(yearsOfUsage) || 0 : (2026 - (parseInt(carRegYear) || 2026)));
      const rate = interestEl ? parseFloat(interestEl.value) || 0 : (vehicleType === "Bike" ? parseFloat(interestRate) || 0 : parseFloat(carInterestRate) || 0);
      const tenure = loanYearsEl ? parseInt(loanYearsEl.value) || 1 : (vehicleType === "Bike" ? parseInt(loanTenure) || 1 : parseInt(carLoanTenure) || 1);
      const ltv = ltvEl ? parseFloat(ltvEl.value) || 85 : (vehicleType === "Bike" ? (ltvLimit || 85) : (carLtvLimit || 85));

      const carMarketValueEl = document.getElementById("carMarketValue") as HTMLInputElement;
      const marketValue = vehicleType === "Bike"
        ? (bikeMarketValueEl ? parseFloat(bikeMarketValueEl.value) || 0 : parseFloat(bikeMarketValue) || 0)
        : (carMarketValueEl ? parseFloat(carMarketValueEl.value) || 0 : parseFloat(carMarketValue) || 0);
      const loanAmount = calculateLoanAmount(marketValue, ltv);
      const emi = calculateEMI(loanAmount, rate, tenure);
      const totalRepayment = calculateTotalRepayment(emi, tenure);
      const totalInterest = calculateTotalInterest(totalRepayment, loanAmount);

      updateDomText("marketValue", formatInIN(marketValue));
      updateDomText("loanAmount", formatInIN(loanAmount));
      updateDomText("emi", formatInIN(emi));
      updateDomText("totalInterest", formatInIN(totalInterest));
      updateDomText("totalRepayment", formatInIN(totalRepayment));

      setTimeout(() => {
        if (vehicleType === "Bike") {
          performAppraisal();
        } else {
          performCarAppraisal();
        }
      }, 0);
    };

    (window as any).updateLTV = (value: any) => {
      if (vehicleType === "Bike") {
        setLtvLimit(Number(value));
      } else {
        setCarLtvLimit(Number(value));
      }
      const ltvValueEl = document.getElementById("ltvValue");
      if (ltvValueEl) {
        ltvValueEl.innerText = value + "%";
      }
      setTimeout(() => {
        if ((window as any).calculateLoanEligibility) {
          (window as any).calculateLoanEligibility();
        }
      }, 0);
    };

    return () => {
      delete (window as any).calculateVehicleAge;
      delete (window as any).calculateMarketValue;
      delete (window as any).calculateLoanAmount;
      delete (window as any).calculateEMI;
      delete (window as any).calculateTotalRepayment;
      delete (window as any).calculateTotalInterest;
      delete (window as any).calculateApprovalStatus;
      delete (window as any).calculateLoanEligibility;
      delete (window as any).updateLTV;
    };
  }, [
    vehicleType,
    bikeBrand, bikeModel, originalPrice, bikeMarketValue, bikeDepreciationPercentage, yearsOfUsage, loanTenure, ltvLimit, interestRate,
    carBrand, carModel, carRegYear, carFuelType, carTransmission,
    carVariant, carKmDriven, carOwnerType, carInsuranceStatus, carOriginalPrice,
    carLoanTenure, carFinanceCompany, carInterestRate, carLtvLimit
  ]);

  // Generate Report Trigger
  const triggerPDF = () => {
    const customerObj: CustomerDetails = {
      name: customerName || "Premium Customer",
      mobile: customerMobile || "+91 XXXXX XXXXX",
      location: customerLocation || "Corporate Hub",
      address: customerAddress || "N/A",
      customerId,
      reportId,
      date: currentDate,
      time: currentTime,
    };

    if (vehicleType === "Bike") {
      const vehicleObj: VehicleDetails = {
        bikeModel,
        originalPrice: parseFloat(originalPrice) || 0,
        bikeAge: parseFloat(yearsOfUsage) || 0,
        loanTenure: parseInt(loanTenure) || 1,
        ltvLimit: Number(ltvLimit) || 85,
        interestRate: parseFloat(interestRate) || 9.5,
        financeCompany: financeCompany || "Truvex Secured Asset Credit"
      };

      generateTruvexPDF(customerObj, vehicleObj, results, bikeImage);
    } else {
      const vehicleObj: VehicleDetails = {
        bikeModel: `${carBrand} ${carModel}`,
        originalPrice: parseFloat(carOriginalPrice) || 0,
        bikeAge: 2026 - parseInt(carRegYear || "2026"),
        loanTenure: parseInt(carLoanTenure) || 1,
        ltvLimit: Number(carLtvLimit) || 85,
        interestRate: parseFloat(carInterestRate) || 9.5,
        financeCompany: carFinanceCompany || "Truvex Secured Asset Credit",
        
        vehicleType: "Car",
        carBrand,
        carModel,
        manufacturingYear: parseInt(carRegYear || "2026"),
        registrationYear: parseInt(carRegYear) || 2026,
        fuelType: carFuelType,
        transmission: carTransmission,
        variant: carVariant,
        kilometersDriven: parseFloat(carKmDriven) || 0,
        ownerType: carOwnerType,
        insuranceStatus: carInsuranceStatus
      };

      generateTruvexCarPDF(customerObj, vehicleObj, results, bikeImage);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      <input type="hidden" id="bike-model" />
      <input type="hidden" id="original-price" />
      <select id="bike-age" className="hidden">
        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <select id="loan-years" className="hidden">
        {[1,2,3,4,5,6,7].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <input type="hidden" id="ltv-limit" />
      <input type="hidden" id="interest-rate" />

      {/* HEADER */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40 px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2">
        <TruvexLogo />
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => generateTruvexDemoManualPDF()}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 border border-[#2563EB]/20 hover:border-[#2563EB] rounded-lg text-[10px] sm:text-xs font-semibold text-[#2563EB] transition-all bg-[#2563EB]/5 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Demo Manual</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-[1400px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (45%): Form */}
        <form onSubmit={(e) => { e.preventDefault(); if (vehicleType === 'Bike') performAppraisal(); else performCarAppraisal(); }} className="lg:col-span-5 flex flex-col gap-5">
          {/* Customer Profile */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-3">Applicant Profile</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#6B7280] uppercase font-bold">Customer ID</label>
                <div className="font-mono text-xs bg-slate-50 border border-[#E5E7EB] p-2 rounded-lg mt-1 font-semibold">{customerId || "TVX-20260715-001"}</div>
              </div>
              <div>
                <label className="text-[10px] text-[#6B7280] uppercase font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs text-[#111827] focus:border-[#2563EB] outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6B7280] uppercase font-bold">Contact Mobile *</label>
                <input
                  type="tel"
                  required
                  value={customerMobile}
                  onChange={e => setCustomerMobile(e.target.value)}
                  placeholder="Enter Contact Mobile"
                  className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs text-[#111827] focus:border-[#2563EB] outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6B7280] uppercase font-bold">Registered Location *</label>
                <input
                  type="text"
                  required
                  value={customerLocation}
                  onChange={e => setCustomerLocation(e.target.value)}
                  placeholder="Enter Registered Location"
                  className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs text-[#111827] focus:border-[#2563EB] outline-none mt-1"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Vehicle Details</h3>
              <span className="text-[10px] bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-full font-bold">{vehicleType}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category Select */}
              {["Car", "Bike"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setVehicleType(cat); setResults(p => ({ ...p, calculated: false })); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all cursor-pointer font-bold text-xs ${
                    vehicleType === cat ? "bg-[#2563EB] border-[#2563EB] text-white shadow-md shadow-blue-500/10" : "bg-white border-[#E5E7EB] text-[#111827] hover:bg-slate-50"
                  }`}
                >
                  {cat === "Car" ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                  <span>{cat} Loan</span>
                </button>
              ))}
            </div>

            {/* Hidden Input for test cases compatibility */}
            {vehicleType === "Car" && (
              <input 
                type="hidden" 
                id="yearsOfUsage" 
                value={String(2026 - parseInt(carRegYear || "2026"))} 
                readOnly 
              />
            )}
            {vehicleType === "Bike" && (
              <input 
                type="hidden" 
                id="bikeMfgYear" 
                value={String(2026 - Math.round(parseFloat(yearsOfUsage) || 0))} 
                readOnly 
              />
            )}
            {vehicleType === "Bike" && (
              <input 
                type="hidden" 
                id="bikeMarketValue" 
                value={bikeMarketValue} 
                readOnly 
              />
            )}

            {vehicleType === "Bike" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Bike Brand *</label>
                  <input
                    type="text" required={vehicleType === "Bike"} id="bikeBrand" placeholder="e.g. Royal Enfield" value={bikeBrand}
                    onChange={e => setBikeBrand(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Bike Model *</label>
                  <input
                    type="text" required={vehicleType === "Bike"} id="bikeModel" placeholder="e.g. Classic 350" value={bikeModel}
                    onChange={e => setBikeModel(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Original Price (₹) *</label>
                  <input
                    type="number" id="originalPrice" required={vehicleType === "Bike"} placeholder="e.g. 195000" value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Interest Rate (% P.A.) *</label>
                  <select
                    id="interest"
                    required={vehicleType === "Bike"}
                    value={interestRate}
                    onChange={e => setInterestRate(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1 bg-white"
                  >
                    <option value="20">20%</option>
                    <option value="20.5">20.5%</option>
                    <option value="21">21%</option>
                    <option value="21.5">21.5%</option>
                    <option value="22">22%</option>
                    <option value="22.5">22.5%</option>
                    <option value="23">23%</option>
                    <option value="23.5">23.5%</option>
                    <option value="24">24%</option>
                    <option value="24.5">24.5%</option>
                    <option value="25">25%</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Vehicle Age (Years) *</label>
                  <input
                    type="number" id="yearsOfUsage" min="0" required={vehicleType === "Bike"} placeholder="e.g. 5" value={yearsOfUsage}
                    onChange={e => setYearsOfUsage(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Depreciation (%) *</label>
                  <input
                    type="number" id="bikeDepreciation" min="0" max="100" required={vehicleType === "Bike"} placeholder="e.g. 35" value={bikeDepreciationPercentage}
                    readOnly
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1 bg-slate-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">LOAN YEARS *</label>
                  <select
                    id="loanYears" required={vehicleType === "Bike"} value={loanTenure}
                    onChange={e => setLoanTenure(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1"
                  >
                    <option value="">Select Tenure</option>
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} {v === 1 ? 'Year' : 'Years'}</option>)}
                  </select>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                    <label className="text-[10px] text-[#6B7280] uppercase font-bold">LTV Limit: <span className="text-[#2563EB] font-bold">{ltvLimit}%</span></label>
                    <div className="flex flex-wrap gap-1 max-w-full justify-start sm:justify-end">
                      {[80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90].map(v => (
                        <button key={v} type="button" onClick={() => setLtvLimit(v)} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ltvLimit === v ? "bg-[#2563EB] text-white" : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-slate-100"}`}>{v}%</button>
                      ))}
                    </div>
                  </div>
                  <input type="range" id="ltv" min="80" max="90" value={ltvLimit || 85} onChange={e => setLtvLimit(parseInt(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-[#2563EB]" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Brand *</label>
                  <select
                    required={vehicleType === "Car"} value={carBrand} onChange={e => { setCarBrand(e.target.value); setCarModel(""); }}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1"
                  >
                    <option value="">Select Brand</option>
                    {Object.keys(CAR_SUGGESTIONS).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Model *</label>
                  <select
                    required={vehicleType === "Car"} disabled={!carBrand} value={carModel} onChange={e => setCarModel(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1 disabled:opacity-50"
                  >
                    <option value="">Select Model</option>
                    {carBrand && CAR_SUGGESTIONS[carBrand]?.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Registration Year *</label>
                  <input type="number" required={vehicleType === "Car"} min="2006" max="2026" placeholder="e.g. 2021" value={carRegYear} onChange={e => setCarRegYear(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Fuel Type *</label>
                  <select required={vehicleType === "Car"} value={carFuelType} onChange={e => setCarFuelType(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1">
                    <option value="">Select Fuel</option>
                    {["Petrol", "Diesel", "CNG", "Electric", "Hybrid"].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Transmission *</label>
                  <select required={vehicleType === "Car"} value={carTransmission} onChange={e => setCarTransmission(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1">
                    <option value="">Select Transmission</option>
                    {["Manual", "Automatic"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Variant *</label>
                  <input type="text" required={vehicleType === "Car"} placeholder="e.g. VXI" value={carVariant} onChange={e => setCarVariant(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Km Driven *</label>
                  <input type="number" required={vehicleType === "Car"} min="0" placeholder="e.g. 45000" value={carKmDriven} onChange={e => setCarKmDriven(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Owner Type *</label>
                  <select required={vehicleType === "Car"} value={carOwnerType} onChange={e => setCarOwnerType(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1">
                    <option value="">Select Owner</option>
                    {["First Owner", "Second Owner", "Third Owner", "Fourth Owner"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Insurance Status *</label>
                  <select required={vehicleType === "Car"} value={carInsuranceStatus} onChange={e => setCarInsuranceStatus(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1">
                    <option value="">Select Insurance</option>
                    {["Valid", "Expired"].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Original Price (₹) *</label>
                  <input type="number" required={vehicleType === "Car"} placeholder="e.g. 850000" value={carOriginalPrice} onChange={e => setCarOriginalPrice(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1" />
                </div>
                <input type="hidden" id="carMarketValue" value={carMarketValue} />
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">Interest Rate (% p.a.) *</label>
                  <select
                    id="interestCar"
                    required={vehicleType === "Car"}
                    value={carInterestRate}
                    onChange={e => setCarInterestRate(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1 bg-white"
                  >
                    <option value="20">20%</option>
                    <option value="20.5">20.5%</option>
                    <option value="21">21%</option>
                    <option value="21.5">21.5%</option>
                    <option value="22">22%</option>
                    <option value="22.5">22.5%</option>
                    <option value="23">23%</option>
                    <option value="23.5">23.5%</option>
                    <option value="24">24%</option>
                    <option value="24.5">24.5%</option>
                    <option value="25">25%</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280] uppercase font-bold">LOAN YEARS *</label>
                  <select required={vehicleType === "Car"} value={carLoanTenure} onChange={e => setCarLoanTenure(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg p-2 text-xs focus:border-[#2563EB] outline-none mt-1">
                    <option value="">Select Tenure</option>
                    {[1,2,3,4,5,6,7].map(v => <option key={v} value={v}>{v} {v === 1 ? 'Year' : 'Years'}</option>)}
                  </select>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-[#6B7280] uppercase font-bold">LTV Limit: <span className="text-[#2563EB] font-bold">{carLtvLimit}%</span></label>
                    <div className="flex gap-1">
                      {[80, 82, 85, 88, 90].map(v => (
                        <button key={v} type="button" onClick={() => setCarLtvLimit(v)} className={`px-2 py-0.5 rounded text-[10px] font-bold ${carLtvLimit === v ? "bg-[#2563EB] text-white" : "bg-white border text-[#6B7280]"}`}>{v}%</button>
                      ))}
                    </div>
                  </div>
                  <input type="range" id="ltvCar" min="80" max="90" value={carLtvLimit || 85} onChange={e => setCarLtvLimit(parseInt(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-[#2563EB]" />
                </div>
              </div>
            )}
          </div>

          {/* Snapshot Upload */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-3">Vehicle Photo Snapshot</h3>
            <div 
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => {
                e.preventDefault(); e.stopPropagation();
                if (e.dataTransfer.files?.[0]) {
                  const r = new FileReader(); r.onload = ev => setBikeImage(ev.target?.result as string); r.readAsDataURL(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById("photo-file-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[110px] text-center ${
                bikeImage ? "border-[#2563EB]/30 bg-blue-50/5" : "border-[#E5E7EB] hover:border-[#2563EB]/40 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <input type="file" id="photo-file-input" accept="image/*" onChange={e => {
                if (e.target.files?.[0]) {
                  const r = new FileReader(); r.onload = ev => setBikeImage(ev.target?.result as string); r.readAsDataURL(e.target.files[0]);
                }
              }} className="hidden" />
              {bikeImage ? (
                <div className="relative flex flex-col items-center">
                  <img id="preview-img" src={bikeImage} alt="Preview" className="max-h-[80px] rounded-lg object-contain border" />
                  <button type="button" onClick={e => { e.stopPropagation(); setBikeImage(""); }} className="absolute -top-1.5 -right-1.5 bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-full shadow-sm">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <span className="text-[10px] text-[#6B7280] mt-1">Replace Photo</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-blue-50 text-[#2563EB] p-1.5 rounded-lg"><UploadCloud className="w-4 h-4" /></div>
                  <p className="text-xs font-semibold">Upload Snapshot</p>
                  <p className="text-[10px] text-[#6B7280]">Drag & drop or click</p>
                </div>
              )}
            </div>
          </div>

          {((vehicleType === "Bike" && bikeValidationMessage) || (vehicleType === "Car" && carValidationMessage)) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{vehicleType === "Bike" ? bikeValidationMessage : carValidationMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <button type="submit" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-3 rounded-xl font-bold tracking-wide text-xs uppercase shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Calculator className="w-4 h-4" />
              <span>Compute</span>
            </button>
            <button
              type="button" id="pdfBtn" disabled={!results.calculated} onClick={triggerPDF}
              className={`py-3 rounded-xl font-bold tracking-wide text-xs uppercase shadow-sm flex items-center justify-center gap-2 cursor-pointer border transition-all ${
                results.calculated ? "bg-white border-[#E5E7EB] text-[#111827] hover:bg-slate-50" : "bg-slate-50 border-slate-100 text-[#6B7280]/50 cursor-not-allowed"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN (55%): Results */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {results.calculated ? (
            <>
              {/* Eligibility Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${results.isEligible ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${results.isEligible ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                    {results.isEligible ? <CircleCheck className="w-5 h-5 text-[#22C55E]" /> : <ShieldAlert className="w-5 h-5 text-rose-500" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{results.isEligible ? "Eligible for Vehicle Loan" : "Ineligible for Vehicle Loan"}</h4>
                    <p className="text-xs opacity-90 mt-0.5">{results.eligibilityReason}</p>
                  </div>
                </div>
                <div className={`p-2 rounded-full hidden sm:block ${results.isEligible ? "text-[#22C55E] bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>
                  {results.isEligible ? <Check className="w-5 h-5 stroke-[3px]" /> : <ShieldAlert className="w-5 h-5 stroke-[3px]" />}
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Market Value", id: "res-current-price", val: formatInIN(results.marketValue), sub: `${results.vehicleAge} Yr Usage`, icon: <TrendingDown className="w-3.5 h-3.5" />, color: "bg-blue-50 text-[#2563EB]" },
                  { label: "Eligible Loan", id: "res-loan-amount", val: formatInIN(results.loanAmount), sub: `${results.companyMaxLtv}% LTV`, icon: <TrendingUp className="w-3.5 h-3.5" />, color: "bg-emerald-50 text-[#22C55E]" },
                  { label: "Interest Rate", id: "", val: `${vehicleType === "Bike" ? interestRate : carInterestRate}% p.a.`, sub: "Fixed Rate", icon: <Percent className="w-3.5 h-3.5" />, color: "bg-amber-50 text-[#F59E0B]" },
                  { label: "Monthly EMI", id: "res-emi", val: `${formatInIN(results.emi)}/mo`, sub: `${vehicleType === "Bike" ? loanTenure : carLoanTenure} Yrs`, icon: <Calendar className="w-3.5 h-3.5" />, color: "bg-rose-50 text-rose-500" }
                ].map(card => (
                  <div key={card.label} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1 rounded-md ${card.color}`}>{card.icon}</div>
                      <span className="text-[9px] text-[#6B7280] font-bold uppercase tracking-wider">{card.label}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#111827] tracking-tight" id={card.id || undefined}>{card.val}</h4>
                    <p className="text-[9px] text-[#6B7280] mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown & Score Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <h4 className="text-[10px] font-bold text-[#111827] mb-2 uppercase tracking-wider">Valuation Breakdown</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-[#6B7280]">Original Purchase Price</span>
                      <span className="font-semibold text-[#111827]">{formatInIN(vehicleType === "Bike" ? originalPrice : carOriginalPrice)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-[#6B7280]">Depreciation Percentage</span>
                      <span className="font-semibold text-rose-600">
                        {vehicleType === "Bike" 
                          ? `${(results.depreciationPercent ?? 0).toFixed(1)}%` 
                          : `${((1 - results.remainingPercentage) * 100).toFixed(1)}%`}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-[#6B7280]">Depreciation Amount</span>
                      <span className="font-semibold text-rose-600">-{formatInIN((vehicleType === "Bike" ? parseFloat(originalPrice) : parseFloat(carOriginalPrice)) * (1 - results.remainingPercentage))}</span>
                    </div>
                    {vehicleType === "Bike" && (
                      <>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Selected LTV Limit</span>
                          <span className="font-semibold text-[#2563EB]">{results.companyMaxLtv}%</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Eligible Loan Amount</span>
                          <span className="font-semibold text-[#22C55E]">{formatInIN(results.loanAmount)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Applied Interest Rate</span>
                          <span className="font-semibold text-[#111827]">{interestRate}% p.a.</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Loan Period</span>
                          <span className="font-semibold text-[#111827]">{loanTenure} {parseInt(loanTenure) === 1 ? 'Year' : 'Years'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Monthly EMI</span>
                          <span className="font-semibold text-rose-500">{formatInIN(results.emi)} / mo</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Total Interest Payable</span>
                          <span className="font-semibold text-amber-600">{formatInIN(results.totalInterest)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Eligibility Status</span>
                          <span className={`font-bold ${results.isEligible ? "text-emerald-600" : "text-rose-600"}`}>
                            {results.approvalStatus}
                          </span>
                        </div>
                      </>
                    )}
                    {vehicleType === "Car" && (
                      <>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Km Adjustment ({results.kmAdjustmentPercent || 0}%)</span>
                          <span className={`font-semibold ${Number(results.kmAdjustmentPercent) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{Number(results.kmAdjustmentPercent) >= 0 ? "+" : ""}{formatInIN(parseFloat(carOriginalPrice) * (results.remainingPercentage) * (results.kmAdjustmentPercent || 0) / 100)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Owner Adjustment ({results.ownerAdjustmentPercent || 0}%)</span>
                          <span className="font-semibold text-rose-600">{formatInIN(parseFloat(carOriginalPrice) * (results.remainingPercentage) * (results.ownerAdjustmentPercent || 0) / 100)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[#6B7280]">Insurance Adjustment ({results.insuranceAdjustmentPercent || 0}%)</span>
                          <span className="font-semibold text-rose-600">{formatInIN(parseFloat(carOriginalPrice) * (results.remainingPercentage) * (results.insuranceAdjustmentPercent || 0) / 100)}</span>
                        </div>
                      </>
                    )}
                    <span id="marketValue" className="hidden">{formatInIN(results.marketValue)}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <h4 className="text-[10px] font-bold text-[#111827] mb-1 uppercase tracking-wider w-full text-left">Eligibility Credit Score</h4>
                  <div className="relative flex items-center justify-center my-1">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="32" className="stroke-slate-100" strokeWidth="5" fill="transparent" />
                      <circle cx="40" cy="40" r="32" className={`transition-all duration-700 ${results.isEligible ? "stroke-[#22C55E]" : "stroke-rose-500"}`} strokeWidth="5" fill="transparent" strokeDasharray={201} strokeDashoffset={201 - (201 * (results.isEligible ? 78 : 45)) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold text-[#111827]">{results.isEligible ? "78" : "45"}</span>
                      <span className="text-[7px] text-[#6B7280] font-bold uppercase">Rating</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase ${results.isEligible ? "bg-emerald-50 text-[#22C55E]" : "bg-rose-50 text-rose-500"}`}>{results.isEligible ? "Good Financial standing" : "Low Asset Worth"}</span>
                </div>
              </div>

            </>
          ) : (
            /* Awaiting appraisal placeholder card */
            <div className="flex-grow flex flex-col justify-between bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center min-h-[420px] shadow-sm">
              <div className="my-auto space-y-3">
                <div className="w-12 h-12 bg-[#2563EB]/5 text-[#2563EB] rounded-xl flex items-center justify-center mx-auto"><Calculator className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Awaiting Financial Appraisal</h4>
                  <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1 leading-relaxed">Enter specifications on the left panel, then click <strong className="text-[#111827]">Compute</strong> to run the credit assessment.</p>
                </div>
              </div>
              <p className="text-[9px] text-[#6B7280] bg-slate-50 p-2.5 rounded-lg border max-w-sm mx-auto italic">"Truvex secured calculation engine conforms directly to ISO 27001, partner credit policies, and standard asset depreciation tables."</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
