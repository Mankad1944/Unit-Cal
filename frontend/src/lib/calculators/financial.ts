import type {
  FinancialInputs,
  FinancialResult,
  NSCYearlyAddition,
  NSCOneTimeAddition,
  NSCScheduleRow,
  NSCResult,
  LoanType,
  RepayFrequency,
  PrepayMode,
  LoanScheduleRow,
  LoanResult,
} from "@/types/calculator";

export function calculateSIP(inputs: FinancialInputs): FinancialResult {
  const {
    monthlySip = 5000,
    rate = 12,
    tenureMonths = 60,
    sipType = "sip",
    sipStepUp = 0,
  } = inputs;

  const months = Math.max(1, Math.floor(tenureMonths));
  const annualRate = rate / 100;
  let totalInvestment = 0;
  let maturityValue = 0;
  const schedule: FinancialResult["schedule"] = [];

  if (sipType === "lumpsum") {
    totalInvestment = monthlySip;
    maturityValue = monthlySip * Math.pow(1 + annualRate, months / 12);
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    let balance = monthlySip;

    for (let period = 1; period <= months; period++) {
      const interestEarned = balance * monthlyRate;
      balance += interestEarned;
      schedule.push({
        period,
        deposited: monthlySip,
        interestEarned: Math.round(interestEarned),
        balance: Math.round(balance),
      });
    }
  } else {
    const monthlyRate = annualRate / 12;
    let balance = 0;

    for (let period = 1; period <= months; period++) {
      const yearIndex = Math.floor((period - 1) / 12);
      const deposit = sipStepUp > 0 ? monthlySip * Math.pow(1 + sipStepUp / 100, yearIndex) : monthlySip;
      totalInvestment += deposit;
      balance += deposit;
      const interestEarned = balance * monthlyRate;
      balance += interestEarned;

      schedule.push({
        period,
        deposited: Math.round(totalInvestment),
        interestEarned: Math.round(interestEarned),
        balance: Math.round(balance),
      });
    }
    maturityValue = balance;
  }

  return {
    totalInvestment: Math.round(totalInvestment),
    maturityValue: Math.round(maturityValue),
    totalInterest: Math.max(0, Math.round(maturityValue - totalInvestment)),
    schedule,
  };
}

export function calculateFD(
  principal = 100000,
  rate = 7.0,
  tenureMonths = 60,
  freq: "monthly" | "quarterly" | "halfyearly" | "yearly" = "quarterly"
): FinancialResult {
  const r = rate / 100;
  const t = tenureMonths / 12;
  const freqMap = { monthly: 12, quarterly: 4, halfyearly: 2, yearly: 1 };
  const n = freqMap[freq] || 4;

  const totalInvestment = principal;
  const maturityValue = principal * Math.pow(1 + r / n, n * t);
  const totalInterest = Math.max(0, maturityValue - principal);

  const schedule: FinancialResult["schedule"] = [];
  let balance = principal;
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  for (let p = 1; p <= tenureMonths; p++) {
    const interestEarned = balance * monthlyRate;
    balance += interestEarned;
    schedule.push({
      period: p,
      deposited: principal,
      interestEarned: Math.round(interestEarned),
      balance: Math.round(balance),
    });
  }

  return {
    totalInvestment: Math.round(totalInvestment),
    maturityValue: Math.round(maturityValue),
    totalInterest: Math.round(totalInterest),
    schedule,
  };
}

export function calculateRD(
  monthlyDeposit = 3880,
  rate = 6.9,
  tenureMonths = 24,
  compFreq: "monthly" | "quarterly" = "quarterly"
): FinancialResult {
  const r = rate / 100;
  const totalInvestment = monthlyDeposit * tenureMonths;
  const schedule: FinancialResult["schedule"] = [];

  if (compFreq === "monthly") {
    const monthlyR = r / 12;
    let bal = 0;
    for (let i = 1; i <= tenureMonths; i++) {
      bal += monthlyDeposit;
      const monthlyInt = bal * monthlyR;
      bal += monthlyInt;
      schedule.push({
        period: i,
        deposited: monthlyDeposit * i,
        interestEarned: Math.round(monthlyInt),
        balance: Math.round(bal),
      });
    }
    const maturityValue = Math.round(bal);
    return {
      totalInvestment,
      maturityValue,
      totalInterest: Math.max(0, maturityValue - totalInvestment),
      schedule,
    };
  }

  // Standard Indian Banking Quarterly Compounding
  const iRate = r / 4;
  let prevBal = 0;
  let totalScheduleInt = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    const m_q = m / 3;
    const curBal =
      (monthlyDeposit * (Math.pow(1 + iRate, m_q) - 1)) /
      (1 - Math.pow(1 + iRate, -1 / 3));
    const intEarned = curBal - prevBal - monthlyDeposit;
    const roundedInt = Math.max(0, Math.round(intEarned));
    totalScheduleInt += roundedInt;
    prevBal = curBal;
    schedule.push({
      period: m,
      deposited: monthlyDeposit * m,
      interestEarned: roundedInt,
      balance: monthlyDeposit * m + totalScheduleInt,
    });
  }

  return {
    totalInvestment,
    maturityValue: totalInvestment + totalScheduleInt,
    totalInterest: totalScheduleInt,
    schedule,
  };
}

export function calculatePPF(
  yearlyDeposit = 150000,
  rate = 7.1,
  years = 15,
  extend: "no" | "yes" = "no"
): FinancialResult {
  const r = rate / 100;
  let totalYears = Math.max(15, years);
  if (extend === "yes") {
    totalYears += 5;
  }

  const totalInvestment = yearlyDeposit * totalYears;
  let balance = 0;
  const schedule: FinancialResult["schedule"] = [];

  for (let y = 1; y <= totalYears; y++) {
    balance += yearlyDeposit;
    const interestEarned = balance * r;
    balance += interestEarned;
    schedule.push({
      period: y,
      deposited: yearlyDeposit * y,
      interestEarned: Math.round(interestEarned),
      balance: Math.round(balance),
    });
  }

  return {
    totalInvestment,
    maturityValue: Math.round(balance),
    totalInterest: Math.round(balance - totalInvestment),
    schedule,
  };
}

export function calculateNSC(
  principal = 100000,
  rate = 7.7,
  startYear = new Date().getFullYear(),
  cycles = 1,
  investMode: "onetime" | "everyyear" = "onetime",
  maturityAction: "reinvestAll" | "renewP" | "withdraw" = "reinvestAll",
  yearlyAdditions: NSCYearlyAddition[] = [],
  oneTimeAdditions: NSCOneTimeAddition[] = []
): NSCResult {
  const r = rate / 100;
  const LOCK = 5; // NSC has a 5-year fixed period for one cycle
  const numCycles = Math.max(1, Math.round(cycles));
  const validStartYear = Math.max(1990, Math.round(startYear) || new Date().getFullYear());

  let activeCerts: Array<{
    startYear: number;
    matYear: number;
    bal: number;
    matBal: number;
    cycle: number;
  }> = [];

  const nscSchedule: NSCScheduleRow[] = [];
  let globalMaturity = 0;
  let globalTotalInvest = 0;
  let totalWithdrawn = 0;

  let maxYear = validStartYear + numCycles * LOCK;
  if (investMode === "everyyear") {
    maxYear += (LOCK - 1);
  }

  for (let y = validStartYear; y <= maxYear; y++) {
    let yearInvested = 0;
    let yearReinvested = 0;
    let yearWithdrawn = 0;
    let yearFinalMaturity = 0;

    // 1. Process maturing certs at year y
    const maturingCerts = activeCerts.filter((c) => c.matYear === y);
    activeCerts = activeCerts.filter((c) => c.matYear !== y);

    for (const c of maturingCerts) {
      const intEarned = c.matBal - c.bal;

      if (c.cycle < numCycles) {
        let nextBal = 0;
        if (maturityAction === "reinvestAll") {
          nextBal = c.matBal;
        } else if (maturityAction === "renewP") {
          nextBal = c.bal;
          yearWithdrawn += intEarned;
        } else {
          yearWithdrawn += c.matBal;
        }

        if (nextBal > 0) {
          activeCerts.push({
            startYear: y,
            matYear: y + LOCK,
            bal: nextBal,
            matBal: Math.round(nextBal * Math.pow(1 + r, LOCK)),
            cycle: c.cycle + 1,
          });
          yearReinvested += nextBal;
        }
      } else {
        yearFinalMaturity += c.matBal;
        globalMaturity += c.matBal;
      }
    }

    // 2. Process fresh investments
    let freshAmt = 0;
    if (investMode === "onetime" && y === validStartYear) {
      freshAmt += principal;
    } else if (investMode === "everyyear" && y < validStartYear + LOCK) {
      freshAmt += principal;
    }

    // Dynamic Yearly Additions
    for (const add of yearlyAdditions) {
      if (
        add.amt > 0 &&
        add.start > 0 &&
        y >= add.start &&
        y <= add.end &&
        y <= maxYear - LOCK
      ) {
        freshAmt += add.amt;
      }
    }

    // Dynamic One-Time Additions
    for (const add of oneTimeAdditions) {
      if (add.amt > 0 && add.years.includes(y)) {
        freshAmt += add.amt;
      }
    }

    if (freshAmt > 0) {
      const cyclesLeft = Math.floor((maxYear - y) / LOCK);
      if (cyclesLeft > 0) {
        activeCerts.push({
          startYear: y,
          matYear: y + LOCK,
          bal: freshAmt,
          matBal: Math.round(freshAmt * Math.pow(1 + r, LOCK)),
          cycle: numCycles - cyclesLeft + 1,
        });
        globalTotalInvest += freshAmt;
        yearInvested += freshAmt;
      }
    }

    totalWithdrawn += yearWithdrawn;

    let runningBal = 0;
    for (const c of activeCerts) {
      const elapsed = y - c.startYear;
      if (elapsed >= 0) {
        runningBal += c.bal * Math.pow(1 + r, elapsed);
      }
    }

    nscSchedule.push({
      year: y,
      invested: Math.round(yearInvested),
      reinvested: Math.round(yearReinvested),
      matured: Math.round(yearFinalMaturity),
      withdrawn: Math.round(yearWithdrawn),
      balance: Math.round(runningBal),
    });
  }

  const totalReturns = globalMaturity + totalWithdrawn;
  const totalInterest = Math.max(0, totalReturns - globalTotalInvest);

  return {
    totalInvestment: Math.round(globalTotalInvest),
    maturityValue: Math.round(globalMaturity),
    totalWithdrawn: Math.round(totalWithdrawn),
    totalReturns: Math.round(totalReturns),
    totalInterest: Math.round(totalInterest),
    schedule: nscSchedule,
  };
}

export function calculateLoan(
  principal = 500000,
  rate = 8.5,
  tenureMonths = 60,
  loanType: LoanType = "vehicle",
  downpayment = 0,
  exchangeVal = 0,
  procFeePct = 0,
  repayFreq: RepayFrequency = "monthly",
  prepayAmt = 0,
  prepayMode: PrepayMode = "tenure",
  moratorium = 0
): LoanResult {
  const annualRate = rate / 100;
  const freqMap: Record<RepayFrequency, number> = {
    monthly: 12,
    quarterly: 4,
    halfyearly: 2,
    yearly: 1,
  };
  const periodsPerYear = freqMap[repayFreq] || 12;
  const r = annualRate / periodsPerYear;
  const n = Math.max(1, Math.round(tenureMonths / (12 / periodsPerYear)));

  const dp = loanType === "vehicle" || loanType === "home" ? downpayment : 0;
  const exVal = loanType === "vehicle" ? exchangeVal : 0;
  let netP = Math.max(0, principal - dp - exVal);

  if (loanType === "education" && moratorium > 0) {
    netP = netP * (1 + (annualRate / 12) * moratorium);
  }

  const fees = netP * (procFeePct / 100);

  let emi = 0;
  if (r === 0) {
    emi = n > 0 ? netP / n : 0;
  } else {
    emi = (netP * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
  if (isNaN(emi) || emi < 0 || !isFinite(emi)) emi = 0;

  let displayEmi = emi;
  let displayN = n;
  let prepayInfo: LoanResult["prepayInfo"] = undefined;

  if (prepayAmt > 0 && prepayAmt < netP) {
    const remainingP = netP - prepayAmt;
    if (prepayMode === "tenure") {
      if (r === 0) {
        displayN = Math.ceil(remainingP / emi);
      } else {
        const numerator = Math.log(1 - (remainingP * r) / emi);
        displayN = Math.ceil(-numerator / Math.log(1 + r));
      }
      if (!isFinite(displayN) || isNaN(displayN) || displayN < 0) displayN = 0;
      prepayInfo = {
        savedPeriods: Math.max(0, n - displayN),
        newTenure: displayN,
      };
    } else {
      if (r === 0) {
        displayEmi = n > 0 ? remainingP / n : 0;
      } else {
        displayEmi = (remainingP * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }
      if (isNaN(displayEmi) || displayEmi < 0 || !isFinite(displayEmi)) displayEmi = 0;
      prepayInfo = {
        newEmi: Math.round(displayEmi),
        emiSaved: Math.max(0, Math.round(emi - displayEmi)),
      };
    }
  }

  const totalPayment = Math.round(displayEmi * displayN + fees);
  const totalInterest = Math.max(0, totalPayment - Math.round(netP));

  const schedule: LoanScheduleRow[] = [];
  let bal = Math.max(0, netP - prepayAmt);
  const scheduleN = prepayMode === "tenure" && prepayAmt > 0 ? displayN : n;

  for (let i = 1; i <= scheduleN; i++) {
    const intPart = bal * r;
    let principalPart = displayEmi - intPart;
    if (i === scheduleN || principalPart > bal) principalPart = bal;
    bal -= principalPart;
    if (bal < 0) bal = 0;
    schedule.push({
      period: i,
      installment: Math.round(displayEmi),
      principal: Math.round(principalPart),
      interest: Math.round(intPart),
      balance: Math.round(bal),
    });
  }

  return {
    loanAmount: Math.round(netP),
    emi: Math.round(emi),
    totalInterest,
    totalPayment,
    schedule,
    prepayInfo,
  };
}
