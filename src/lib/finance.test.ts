import { describe, expect, it } from 'vitest';
import {
  bondCashflows,
  bondPrice,
  compoundGrowth,
  emergencyPlan,
  feeDrag,
  mmfReturn,
  purchasingPower,
  realRatePct,
  tbillReturn,
  yieldToMaturityPct,
} from './finance';

describe('compoundGrowth', () => {
  it('annual compounding gives exactly the annual rate after a year', () => {
    const pts = compoundGrowth({ initial: 1000, monthly: 0, annualRatePct: 10, years: 1, compoundsPerYear: 1 });
    expect(pts).toHaveLength(2);
    expect(pts[1].balance).toBeCloseTo(1100, 6);
  });

  it('monthly compounding beats annual compounding', () => {
    const pts = compoundGrowth({ initial: 1000, monthly: 0, annualRatePct: 10, years: 1 });
    expect(pts[1].balance).toBeCloseTo(1000 * Math.pow(1 + 0.1 / 12, 12), 6);
  });

  it('adds monthly contributions with no growth at 0%', () => {
    const pts = compoundGrowth({ initial: 0, monthly: 100, annualRatePct: 0, years: 2 });
    expect(pts[2].balance).toBeCloseTo(2400, 6);
    expect(pts[2].contributed).toBe(2400);
  });

  it('ignores fractional and negative years', () => {
    expect(compoundGrowth({ initial: 1, monthly: 0, annualRatePct: 5, years: 2.7 })).toHaveLength(3);
    expect(compoundGrowth({ initial: 1, monthly: 0, annualRatePct: 5, years: -3 })).toHaveLength(1);
  });
});

describe('inflation', () => {
  it('computes the real rate with the Fisher relation', () => {
    expect(realRatePct(10, 5)).toBeCloseTo(4.7619, 3);
    expect(realRatePct(5, 5)).toBeCloseTo(0, 10);
    expect(realRatePct(3, 6)).toBeLessThan(0);
  });

  it('shrinks purchasing power over time', () => {
    expect(purchasingPower(100000, 5, 10)).toBeCloseTo(61391.33, 1);
    expect(purchasingPower(100000, 0, 10)).toBe(100000);
  });
});

describe('feeDrag', () => {
  it('reports what fees cost over time', () => {
    const r = feeDrag({ initial: 100000, monthly: 0, grossRatePct: 10, feePct: 2, years: 20 });
    expect(r.withoutFees).toBeGreaterThan(r.withFees);
    expect(r.lost).toBeCloseTo(r.withoutFees - r.withFees, 6);
    expect(r.lostPct).toBeGreaterThan(25);
  });

  it('costs nothing with zero fees', () => {
    const r = feeDrag({ initial: 5000, monthly: 1000, grossRatePct: 8, feePct: 0, years: 5 });
    expect(r.lost).toBeCloseTo(0, 8);
  });
});

describe('income products', () => {
  it('compounds an MMF daily and applies withholding tax', () => {
    const r = mmfReturn({ amount: 100000, annualYieldPct: 10, days: 365, whtPct: 15 });
    expect(r.gross).toBeCloseTo(100000 * (Math.pow(1 + 0.1 / 365, 365) - 1), 6);
    expect(r.tax).toBeCloseTo(r.gross * 0.15, 6);
    expect(r.endValue).toBeCloseTo(100000 + r.net, 6);
  });

  it('treats a T-bill rate as simple interest over the tenor', () => {
    const r = tbillReturn({ amount: 100000, annualRatePct: 10, days: 365, whtPct: 15 });
    expect(r.gross).toBeCloseTo(10000, 6);
    expect(r.net).toBeCloseTo(8500, 6);
  });
});

describe('bonds', () => {
  it('prices a bond at par when the yield equals the coupon', () => {
    expect(bondPrice(100, 3, 10, 0.03)).toBeCloseTo(100, 8);
    expect(bondPrice(100, 3, 10, 0)).toBe(130);
  });

  it('finds the yield to maturity', () => {
    expect(yieldToMaturityPct(100, 100, 3, 10, 2)).toBeCloseTo(6, 6);
    expect(yieldToMaturityPct(95, 100, 3, 10, 2)).toBeGreaterThan(6);
    expect(yieldToMaturityPct(105, 100, 3, 10, 2)).toBeLessThan(6);
    expect(yieldToMaturityPct(100, 100, 3, 0, 2)).toBeNaN();
  });

  it('summarises coupons after withholding tax', () => {
    const r = bondCashflows({ faceValue: 100000, couponPct: 12, years: 5, pricePct: 100, whtPct: 10 });
    expect(r.couponPerPayment).toBeCloseTo(6000, 6);
    expect(r.netCouponPerPayment).toBeCloseTo(5400, 6);
    expect(r.payments).toBe(10);
    expect(r.totalNetCoupons).toBeCloseTo(54000, 6);
    expect(r.currentYieldPct).toBeCloseTo(12, 6);
    expect(r.ytmPct).toBeCloseTo(12, 6);
    expect(r.gain).toBeCloseTo(54000, 6);
  });
});

describe('emergencyPlan', () => {
  it('computes target, gap and months to goal', () => {
    const p = emergencyPlan({ monthlyEssentials: 30000, months: 6, saved: 50000, monthlySaving: 10000 });
    expect(p.target).toBe(180000);
    expect(p.gap).toBe(130000);
    expect(p.monthsToGoal).toBe(13);
    expect(p.progressPct).toBeCloseTo(27.78, 1);
  });

  it('handles a finished goal and no saving', () => {
    expect(emergencyPlan({ monthlyEssentials: 10, months: 3, saved: 100, monthlySaving: 0 }).monthsToGoal).toBe(0);
    expect(emergencyPlan({ monthlyEssentials: 10, months: 3, saved: 0, monthlySaving: 0 }).monthsToGoal).toBe(Infinity);
  });
});
