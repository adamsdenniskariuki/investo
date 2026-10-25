export interface GrowthPoint {
  year: number;
  contributed: number;
  balance: number;
}

export interface GrowthInput {
  initial: number;
  monthly: number;
  annualRatePct: number;
  years: number;
  compoundsPerYear?: number;
}

/** Equivalent monthly rate for a nominal annual rate compounded `compoundsPerYear` times. */
export function monthlyRateFromAnnual(annualRatePct: number, compoundsPerYear = 12): number {
  const r = annualRatePct / 100;
  const n = compoundsPerYear;
  return Math.pow(1 + r / n, n / 12) - 1;
}

/** Year-by-year balance with contributions added at the end of each month. */
export function compoundGrowth({
  initial,
  monthly,
  annualRatePct,
  years,
  compoundsPerYear = 12,
}: GrowthInput): GrowthPoint[] {
  const m = monthlyRateFromAnnual(annualRatePct, compoundsPerYear);
  const totalYears = Math.max(0, Math.floor(years));
  let balance = initial;
  let contributed = initial;
  const points: GrowthPoint[] = [{ year: 0, contributed, balance }];
  for (let y = 1; y <= totalYears; y++) {
    for (let k = 0; k < 12; k++) {
      balance = balance * (1 + m) + monthly;
      contributed += monthly;
    }
    points.push({ year: y, contributed, balance });
  }
  return points;
}

/** Real (inflation-adjusted) rate, using the exact Fisher relation. */
export function realRatePct(nominalPct: number, inflationPct: number): number {
  return ((1 + nominalPct / 100) / (1 + inflationPct / 100) - 1) * 100;
}

/** What `amount` today will buy after `years` of inflation, in today's shillings. */
export function purchasingPower(amount: number, inflationPct: number, years: number): number {
  return amount / Math.pow(1 + inflationPct / 100, years);
}

export interface FeeDragResult {
  withoutFees: number;
  withFees: number;
  lost: number;
  lostPct: number;
  contributed: number;
}

/** Compares growth at a gross rate with growth after an annual fee is taken off the rate. */
export function feeDrag(input: {
  initial: number;
  monthly: number;
  grossRatePct: number;
  feePct: number;
  years: number;
}): FeeDragResult {
  const base = { initial: input.initial, monthly: input.monthly, years: input.years };
  const a = compoundGrowth({ ...base, annualRatePct: input.grossRatePct });
  const b = compoundGrowth({ ...base, annualRatePct: input.grossRatePct - input.feePct });
  const withoutFees = a[a.length - 1].balance;
  const withFees = b[b.length - 1].balance;
  const lost = withoutFees - withFees;
  return {
    withoutFees,
    withFees,
    lost,
    lostPct: withoutFees > 0 ? (lost / withoutFees) * 100 : 0,
    contributed: a[a.length - 1].contributed,
  };
}

export interface IncomeResult {
  gross: number;
  tax: number;
  net: number;
  endValue: number;
}

/** Money market fund: quoted annual yield compounded daily, with withholding tax on the income. */
export function mmfReturn(input: {
  amount: number;
  annualYieldPct: number;
  days: number;
  whtPct: number;
}): IncomeResult {
  const gross = input.amount * (Math.pow(1 + input.annualYieldPct / 100 / 365, input.days) - 1);
  const tax = (gross * input.whtPct) / 100;
  return { gross, tax, net: gross - tax, endValue: input.amount + gross - tax };
}

/**
 * Treasury bill, simplified: the rate is treated as a simple annual yield over the tenor.
 * CBK's actual discount pricing gives slightly different figures.
 */
export function tbillReturn(input: {
  amount: number;
  annualRatePct: number;
  days: number;
  whtPct: number;
}): IncomeResult {
  const gross = (input.amount * input.annualRatePct * input.days) / 100 / 365;
  const tax = (gross * input.whtPct) / 100;
  return { gross, tax, net: gross - tax, endValue: input.amount + gross - tax };
}

/** Present value of a bond's cash flows at a periodic discount rate. */
export function bondPrice(face: number, couponPerPeriod: number, periods: number, periodicRate: number): number {
  if (periodicRate === 0) return couponPerPeriod * periods + face;
  const d = Math.pow(1 + periodicRate, -periods);
  return (couponPerPeriod * (1 - d)) / periodicRate + face * d;
}

/** Annualised yield to maturity (periodic rate × payments per year), found by bisection. */
export function yieldToMaturityPct(
  price: number,
  face: number,
  couponPerPeriod: number,
  periods: number,
  paymentsPerYear: number,
): number {
  if (!(periods > 0) || !(price > 0) || !(face > 0)) return NaN;
  let lo = -0.99;
  let hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (bondPrice(face, couponPerPeriod, periods, mid) > price) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * paymentsPerYear * 100;
}

export interface BondResult {
  price: number;
  couponPerPayment: number;
  netCouponPerPayment: number;
  annualCoupon: number;
  payments: number;
  currentYieldPct: number;
  ytmPct: number;
  totalNetCoupons: number;
  totalReceived: number;
  gain: number;
}

export function bondCashflows(input: {
  faceValue: number;
  couponPct: number;
  years: number;
  pricePct: number;
  whtPct: number;
  paymentsPerYear?: number;
}): BondResult {
  const ppy = input.paymentsPerYear ?? 2;
  const couponPerPayment = (input.faceValue * input.couponPct) / 100 / ppy;
  const payments = Math.max(0, Math.round(input.years * ppy));
  const netCouponPerPayment = couponPerPayment * (1 - input.whtPct / 100);
  const price = (input.faceValue * input.pricePct) / 100;
  const annualCoupon = couponPerPayment * ppy;
  const totalNetCoupons = netCouponPerPayment * payments;
  const totalReceived = totalNetCoupons + input.faceValue;
  return {
    price,
    couponPerPayment,
    netCouponPerPayment,
    annualCoupon,
    payments,
    currentYieldPct: price > 0 ? (annualCoupon / price) * 100 : 0,
    ytmPct: yieldToMaturityPct(price, input.faceValue, couponPerPayment, payments, ppy),
    totalNetCoupons,
    totalReceived,
    gain: totalReceived - price,
  };
}

export interface EmergencyPlan {
  target: number;
  gap: number;
  progressPct: number;
  monthsToGoal: number;
}

export function emergencyPlan(input: {
  monthlyEssentials: number;
  months: number;
  saved: number;
  monthlySaving: number;
}): EmergencyPlan {
  const target = Math.max(0, input.monthlyEssentials * input.months);
  const gap = Math.max(0, target - input.saved);
  let monthsToGoal: number;
  if (gap === 0) monthsToGoal = 0;
  else if (input.monthlySaving > 0) monthsToGoal = Math.ceil(gap / input.monthlySaving);
  else monthsToGoal = Infinity;
  return {
    target,
    gap,
    progressPct: target > 0 ? Math.min(100, (Math.max(0, input.saved) / target) * 100) : 0,
    monthsToGoal,
  };
}
