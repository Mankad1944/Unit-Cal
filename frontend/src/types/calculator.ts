export type Language = "en" | "gu";
export type Theme = "light" | "dark";
export type AppMode = "unit" | "fin" | "basic";

export type UnitCategory =
  | "length"
  | "height"
  | "area"
  | "weight"
  | "volume"
  | "wv"
  | "temperature"
  | "speed"
  | "time"
  | "digital";

export interface UnitDefinition {
  key: string;
  labelEn: string;
  labelGu: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  gujarati?: boolean;
  group?: string;
}

export interface ConversionResult {
  key: string;
  labelEn: string;
  labelGu: string;
  result: number;
}

export type FinancialCategory =
  | "sip"
  | "fd"
  | "rd"
  | "ppf"
  | "nsc"
  | "loan";

export type LoanType = "vehicle" | "home" | "personal" | "education";
export type RepayFrequency = "monthly" | "quarterly" | "halfyearly" | "yearly";
export type PrepayMode = "tenure" | "emi";
export type NSCInvestMode = "onetime" | "everyyear";
export type NSCMaturityAction = "reinvestAll" | "renewP" | "withdraw";

export interface NSCYearlyAddition {
  id: string;
  amt: number;
  start: number;
  end: number;
}

export interface NSCOneTimeAddition {
  id: string;
  amt: number;
  years: number[];
  yearsStr?: string;
}

export interface NSCScheduleRow {
  year: number;
  invested: number;
  reinvested: number;
  withdrawn: number;
  matured: number;
  balance: number;
}

export interface NSCResult {
  totalInvestment: number;
  maturityValue: number;
  totalWithdrawn: number;
  totalReturns: number;
  totalInterest: number;
  schedule: NSCScheduleRow[];
}

export interface LoanScheduleRow {
  period: number;
  installment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  loanAmount: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: LoanScheduleRow[];
  prepayInfo?: {
    savedPeriods?: number;
    newTenure?: number;
    newEmi?: number;
    emiSaved?: number;
  };
}

export interface FinancialInputs {
  principal?: number;
  monthlyDeposit?: number;
  monthlySip?: number;
  rate: number;
  tenureMonths: number;
  tenureYears?: number;
  sipType?: "sip" | "lumpsum";
  sipStepUp?: number;
  fdCompFreq?: "monthly" | "quarterly" | "halfyearly" | "yearly";
  rdCompFreq?: "monthly" | "quarterly";
}

export interface FinancialScheduleRow {
  period: number;
  deposited?: number;
  interestEarned: number;
  balance: number;
  installment?: number;
  principal?: number;
}

export interface FinancialResult {
  totalInvestment: number;
  maturityValue: number;
  totalInterest: number;
  schedule: FinancialScheduleRow[];
  emi?: number;
  nscSchedule?: NSCScheduleRow[];
  loanSchedule?: LoanScheduleRow[];
  prepayInfo?: LoanResult["prepayInfo"];
}

export interface SubstanceDensity {
  key: string;
  nameEn: string;
  nameGu: string;
  density: number; // kg per cubic metre (kg/m3). 1 L = 0.001 m3, so density in kg/L is density / 1000
  icon: string;
}

export interface HistoryItem {
  _id?: string;
  id?: string;
  category: string;
  title: string;
  expression?: string;
  result: string;
  createdAt?: string;
  timestamp?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  permissions?: Record<string, boolean>;
}
