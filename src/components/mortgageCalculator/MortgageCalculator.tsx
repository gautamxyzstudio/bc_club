/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calculator,
  Home,
  Percent,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export interface MortgageCalculatorProps {
  initialHomePrice?: number;
  initialDownPaymentPercent?: number;
  initialInterestRate?: number;
  initialLoanTerm?: number;
  className?: string;
  propertyAddress?: string;
}

export interface MortgageBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  totalMonthly: number;
  loanAmount: number;
  totalInterestPaid: number;
  totalCost: number;
  isPmiRequired: boolean;
}

/**
 * Custom Hook: useMortgageCalculator
 * Implements real-time reactive state synchronization and mortgage math.
 */
export function useMortgageCalculator({
  initialHomePrice = 400000,
  initialDownPaymentPercent = 20,
  initialInterestRate = 6.5,
  initialLoanTerm = 30,
}: {
  initialHomePrice?: number;
  initialDownPaymentPercent?: number;
  initialInterestRate?: number;
  initialLoanTerm?: number;
} = {}) {
  // 1. Core reactive state parameters
  const [homePrice, setHomePriceState] = useState<number>(initialHomePrice);
  const [downPayment, setDownPaymentState] = useState<number>(
    Math.round((initialHomePrice * initialDownPaymentPercent) / 100)
  );
  const [downPaymentPercent, setDownPaymentPercentState] =
    useState<number>(initialDownPaymentPercent);
  const [interestRate, setInterestRate] = useState<number>(initialInterestRate);
  const [loanTerm, setLoanTerm] = useState<number>(initialLoanTerm);

  // Secondary configurable estimates
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2); // 1.2% annual
  const [homeInsuranceRate, setHomeInsuranceRate] = useState<number>(0.35); // 0.35% annual
  const [pmiRate, setPmiRate] = useState<number>(0.75); // 0.75% annual of principal when down payment < 20%

  // Sync if initialHomePrice prop changes
  useEffect(() => {
    if (initialHomePrice && initialHomePrice > 0) {
      setHomePriceState(initialHomePrice);
      setDownPaymentState(
        Math.round((initialHomePrice * downPaymentPercent) / 100)
      );
    }
  }, [initialHomePrice]);

  // Synchronized handlers
  const handleHomePriceChange = useCallback(
    (newPrice: number) => {
      const sanitizedPrice = Math.max(0, newPrice);
      setHomePriceState(sanitizedPrice);
      // Keep percentage constant and update dollar down payment
      const newDownPayment = Math.min(
        sanitizedPrice,
        Math.round((sanitizedPrice * downPaymentPercent) / 100)
      );
      setDownPaymentState(newDownPayment);
    },
    [downPaymentPercent]
  );

  const handleDownPaymentAmountChange = useCallback(
    (newAmount: number) => {
      const sanitizedAmount = Math.max(0, Math.min(homePrice, newAmount));
      setDownPaymentState(sanitizedAmount);
      const newPercent =
        homePrice > 0 ? (sanitizedAmount / homePrice) * 100 : 0;
      setDownPaymentPercentState(Number(newPercent.toFixed(2)));
    },
    [homePrice]
  );

  const handleDownPaymentPercentChange = useCallback(
    (newPercent: number) => {
      const sanitizedPercent = Math.max(0, Math.min(100, newPercent));
      setDownPaymentPercentState(sanitizedPercent);
      const newAmount = Math.round((homePrice * sanitizedPercent) / 100);
      setDownPaymentState(newAmount);
    },
    [homePrice]
  );

  // Reactive Calculations
  const breakdown: MortgageBreakdown = useMemo(() => {
    const loanAmount = Math.max(0, homePrice - downPayment);
    const isPmiRequired = downPaymentPercent < 20 && loanAmount > 0;

    // Monthly rates and payment count
    const monthlyRate = interestRate > 0 ? interestRate / 100 / 12 : 0;
    const totalPayments = Math.max(1, loanTerm * 12);

    // Standard fixed-rate mortgage payment formula:
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let principalAndInterest = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        principalAndInterest = loanAmount / totalPayments;
      } else {
        const factor = Math.pow(1 + monthlyRate, totalPayments);
        principalAndInterest =
          loanAmount * ((monthlyRate * factor) / (factor - 1));
      }
    }

    // Secondary calculations:
    // Property Taxes: 1.2% of home value annually
    const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;

    // Home Insurance: 0.35% of home value annually
    const monthlyHomeInsurance = (homePrice * (homeInsuranceRate / 100)) / 12;

    // PMI: 0.75% of principal annually (only when down payment < 20%)
    const monthlyPmi = isPmiRequired
      ? (loanAmount * (pmiRate / 100)) / 12
      : 0;

    const totalMonthly =
      principalAndInterest +
      monthlyPropertyTax +
      monthlyHomeInsurance +
      monthlyPmi;

    const totalLoanPayments = principalAndInterest * totalPayments;
    const totalInterestPaid = Math.max(0, totalLoanPayments - loanAmount);
    const totalCost = totalLoanPayments + downPayment;

    return {
      principalAndInterest: Math.round(principalAndInterest),
      propertyTax: Math.round(monthlyPropertyTax),
      homeInsurance: Math.round(monthlyHomeInsurance),
      pmi: Math.round(monthlyPmi),
      totalMonthly: Math.round(totalMonthly),
      loanAmount: Math.round(loanAmount),
      totalInterestPaid: Math.round(totalInterestPaid),
      totalCost: Math.round(totalCost),
      isPmiRequired,
    };
  }, [
    homePrice,
    downPayment,
    downPaymentPercent,
    interestRate,
    loanTerm,
    propertyTaxRate,
    homeInsuranceRate,
    pmiRate,
  ]);

  return {
    homePrice,
    downPayment,
    downPaymentPercent,
    interestRate,
    loanTerm,
    propertyTaxRate,
    homeInsuranceRate,
    pmiRate,
    breakdown,
    setHomePrice: handleHomePriceChange,
    setDownPaymentAmount: handleDownPaymentAmountChange,
    setDownPaymentPercent: handleDownPaymentPercentChange,
    setInterestRate,
    setLoanTerm,
    setPropertyTaxRate,
    setHomeInsuranceRate,
    setPmiRate,
  };
}

/**
 * MortgageCalculator Component
 * Split-grid interactive mortgage calculator widget with fully responsive Tailwind design
 */
export function MortgageCalculator({
  initialHomePrice = 400000,
  initialDownPaymentPercent = 20,
  initialInterestRate = 6.5,
  initialLoanTerm = 30,
  className = "",
  propertyAddress,
}: MortgageCalculatorProps) {
  const {
    homePrice,
    downPayment,
    downPaymentPercent,
    interestRate,
    loanTerm,
    propertyTaxRate,
    homeInsuranceRate,
    pmiRate,
    breakdown,
    setHomePrice,
    setDownPaymentAmount,
    setDownPaymentPercent,
    setInterestRate,
    setLoanTerm,
    setPropertyTaxRate,
    setHomeInsuranceRate,
    setPmiRate,
  } = useMortgageCalculator({
    initialHomePrice,
    initialDownPaymentPercent,
    initialInterestRate,
    initialLoanTerm,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Quick preset percentages
  const downPaymentPresets = [5, 10, 15, 20, 25];

  // Quick loan term options
  const loanTermOptions = [
    { label: "15 Yrs", value: 15 },
    { label: "20 Yrs", value: 20 },
    { label: "25 Yrs", value: 25 },
    { label: "30 Yrs", value: 30 },
  ];

  // Visual breakdown percentage calculations for the progress bar
  const total = breakdown.totalMonthly > 0 ? breakdown.totalMonthly : 1;
  const piPct = Math.round((breakdown.principalAndInterest / total) * 100);
  const taxPct = Math.round((breakdown.propertyTax / total) * 100);
  const insPct = Math.round((breakdown.homeInsurance / total) * 100);
  const pmiPct = breakdown.isPmiRequired
    ? Math.max(0, 100 - (piPct + taxPct + insPct))
    : 0;

  return (
    <div
      id="mortgage-calculator"
      className={`scroll-mt-24 w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 xs:p-5 sm:p-6 md:p-8 lg:p-8 xl:p-10 shadow-xs transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* Top Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-5 sm:pb-6 md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 xs:h-10 xs:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Calculator className="h-4 w-4 xs:h-5 xs:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold tracking-tight text-slate-900 truncate">
                Mortgage Calculator
              </h2>
              {propertyAddress && (
                <p className="text-xs text-slate-500 truncate max-w-[260px] xs:max-w-xs sm:max-w-md">
                  Estimating monthly payments for {propertyAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-slate-100/90 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-600 md:self-auto shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Real-time payment estimation</span>
        </div>
      </div>

      {/* Split Grid Container: single column on mobile/tablet, 12-col on lg+ */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-10 items-start">
        {/* ================= LEFT COLUMN: Sliders & Form Fields ================= */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-7 min-w-0">
          {/* 1. Home Price */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 transition-colors focus-within:border-blue-200 focus-within:bg-blue-50/20">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 min-w-0">
                <Home className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="truncate">Home Price</span>
              </label>
              <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200/80 shrink-0 shadow-2xs">
                ${homePrice.toLocaleString()}
              </span>
            </div>

            <div className="relative mb-3">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 select-none pointer-events-none">
                $
              </span>
              <input
                type="number"
                min={10000}
                max={10000000}
                step={5000}
                value={homePrice || ""}
                onChange={(e) => setHomePrice(Number(e.target.value) || 0)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-8 text-base font-bold text-slate-900 shadow-2xs transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="400,000"
              />
            </div>

            {/* Slider */}
            <input
              type="range"
              min={50000}
              max={3000000}
              step={10000}
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-blue-600 touch-pan-x"
            />
            <div className="mt-1 flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-400">
              <span>$50,000</span>
              <span>$1.5M</span>
              <span>$3M+</span>
            </div>
          </div>

          {/* 2. Down Payment (Dual Input: $ & %) */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 transition-colors focus-within:border-blue-200 focus-within:bg-blue-50/20">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 min-w-0">
                <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">Down Payment</span>
              </label>
              <div className="flex items-center gap-1.5 shrink-0">
                {downPaymentPercent < 20 ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                    <ShieldAlert className="h-3 w-3 shrink-0" />
                    PMI Required (&lt;20%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    No PMI (≥20%)
                  </span>
                )}
              </div>
            </div>

            {/* Responsive Dual Inputs: stacked on mobile, 2 cols on sm+ */}
            <div className="mb-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {/* Dollar Amount */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 select-none pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  max={homePrice}
                  step={1000}
                  value={downPayment || ""}
                  onChange={(e) =>
                    setDownPaymentAmount(Number(e.target.value) || 0)
                  }
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-8 text-base font-bold text-slate-900 shadow-2xs transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="80,000"
                />
              </div>

              {/* Percentage */}
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={downPaymentPercent || ""}
                  onChange={(e) =>
                    setDownPaymentPercent(Number(e.target.value) || 0)
                  }
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-4 text-base font-bold text-slate-900 shadow-2xs transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="20"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 select-none pointer-events-none">
                  %
                </span>
              </div>
            </div>

            {/* Down Payment Presets */}
            <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
              {downPaymentPresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all min-h-[32px] sm:min-h-[34px] touch-manipulation cursor-pointer ${
                    Math.round(downPaymentPercent) === pct
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-blue-600 touch-pan-x"
            />
            <div className="mt-1 flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-400">
              <span>0% ($0)</span>
              <span>20% (PMI Free)</span>
              <span>100%</span>
            </div>
          </div>

          {/* 3. Interest Rate & Loan Term Grid: 1 col on mobile, 2 cols on sm+ */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
            {/* Interest Rate */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 transition-colors focus-within:border-blue-200 focus-within:bg-blue-50/20">
              <label className="mb-2 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Interest Rate</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Fixed</span>
              </label>

              <div className="relative mb-3">
                <input
                  type="number"
                  min={0.1}
                  max={20}
                  step={0.1}
                  value={interestRate || ""}
                  onChange={(e) =>
                    setInterestRate(Number(e.target.value) || 0)
                  }
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-4 text-base font-bold text-slate-900 shadow-2xs transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="6.5"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 select-none pointer-events-none">
                  %
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={15}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-amber-500 touch-pan-x"
              />
              <div className="mt-1 flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-400">
                <span>1%</span>
                <span>6.5%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 transition-colors focus-within:border-blue-200 focus-within:bg-blue-50/20">
              <label className="mb-2 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>Loan Term</span>
                </span>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {loanTerm} Years
                </span>
              </label>

              {/* Term Selector Pills: 2x2 on <400px, 4 in row on xs+ */}
              <div className="grid grid-cols-2 gap-1.5 xs:grid-cols-4">
                {loanTermOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLoanTerm(option.value)}
                    className={`rounded-xl py-2.5 px-1 text-center text-xs font-bold transition-all min-h-[40px] touch-manipulation cursor-pointer ${
                      loanTerm === option.value
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 sm:mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs text-slate-500 border border-slate-100">
                <span className="text-[11px] sm:text-xs">Total Payments:</span>
                <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                  {loanTerm * 12} Months
                </span>
              </div>
            </div>
          </div>

          {/* 4. Advanced Settings Accordion */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left text-xs sm:text-sm font-semibold text-slate-700 transition hover:text-blue-600 cursor-pointer gap-2"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="truncate">Customize Taxes, Insurance &amp; PMI Rates</span>
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </button>

            {showAdvanced && (
              <div className="border-t border-slate-100 p-4 sm:p-5 space-y-4 bg-slate-50/40 rounded-b-xl sm:rounded-b-2xl">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  {/* Property Tax */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Annual Property Tax
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={0.05}
                        min={0}
                        max={5}
                        value={propertyTaxRate}
                        onChange={(e) =>
                          setPropertyTaxRate(Number(e.target.value) || 0)
                        }
                        className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">
                        %
                      </span>
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      Est. ${(breakdown.propertyTax * 12).toLocaleString()}/yr
                    </span>
                  </div>

                  {/* Home Insurance */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Home Insurance Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={0.05}
                        min={0}
                        max={3}
                        value={homeInsuranceRate}
                        onChange={(e) =>
                          setHomeInsuranceRate(Number(e.target.value) || 0)
                        }
                        className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">
                        %
                      </span>
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      Est. ${(breakdown.homeInsurance * 12).toLocaleString()}/yr
                    </span>
                  </div>

                  {/* PMI Rate */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      PMI Rate (&lt;20% down)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={0.05}
                        min={0}
                        max={3}
                        value={pmiRate}
                        onChange={(e) => setPmiRate(Number(e.target.value) || 0)}
                        className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-7 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">
                        %
                      </span>
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {breakdown.isPmiRequired
                        ? `Est. $${(breakdown.pmi * 12).toLocaleString()}/yr`
                        : "Exempt (≥20% down)"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Aggregated Payment Callout Card ================= */}
        <div className="lg:col-span-5 min-w-0">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 via-white to-slate-50/80 p-4 xs:p-5 sm:p-6 shadow-sm">
            {/* Total Monthly Payment Header */}
            <div className="mb-5 sm:mb-6">
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase">
                Total Estimated Payment
              </span>
              <div className="mt-1 flex flex-wrap items-baseline gap-1 sm:gap-1.5">
                <span className="text-3xl xs:text-4xl sm:text-4xl xl:text-3xl 2xl:text-5xl font-black tracking-tight text-slate-900">
                  ${breakdown.totalMonthly.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-500">
                  /month
                </span>
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Principal, interest, taxes, and estimated insurance
              </p>
            </div>

            {/* Visual Color-Coded Multi-Segment Progress Bar */}
            <div className="mb-5 sm:mb-6">
              <div className="mb-2 flex h-3 sm:h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5">
                <div
                  style={{ width: `${piPct}%` }}
                  className="h-full rounded-l-full bg-blue-600 transition-all duration-300"
                  title={`Principal & Interest: ${piPct}%`}
                />
                <div
                  style={{ width: `${taxPct}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title={`Property Taxes: ${taxPct}%`}
                />
                <div
                  style={{ width: `${insPct}%` }}
                  className="h-full bg-amber-500 transition-all duration-300"
                  title={`Home Insurance: ${insPct}%`}
                />
                {breakdown.isPmiRequired && (
                  <div
                    style={{ width: `${pmiPct}%` }}
                    className="h-full rounded-r-full bg-rose-500 transition-all duration-300"
                    title={`PMI: ${pmiPct}%`}
                  />
                )}
              </div>

              {/* Progress Bar Legend */}
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-[10px] sm:text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <span>P&amp;I ({piPct}%)</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Taxes ({taxPct}%)</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Ins ({insPct}%)</span>
                </span>
                {breakdown.isPmiRequired && (
                  <span className="flex items-center gap-1 font-medium text-rose-600">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                    <span>PMI ({pmiPct}%)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Colored Micro-Breakdown Rows */}
            <div className="mb-5 sm:mb-6 divide-y divide-slate-100 rounded-xl border border-slate-200/60 bg-white p-1 shadow-2xs">
              {/* Row 1: Principal & Interest */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 truncate">
                      Principal &amp; Interest
                    </span>
                    <span className="block text-[10px] sm:text-[11px] text-slate-400 truncate">
                      {loanTerm} yrs @ {interestRate}% fixed
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 shrink-0 text-right">
                  ${breakdown.principalAndInterest.toLocaleString()}
                </span>
              </div>

              {/* Row 2: Property Taxes */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 truncate">
                      Property Taxes
                    </span>
                    <span className="block text-[10px] sm:text-[11px] text-slate-400 truncate">
                      Est. @ {propertyTaxRate}%/yr
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 shrink-0 text-right">
                  ${breakdown.propertyTax.toLocaleString()}
                </span>
              </div>

              {/* Row 3: Home Insurance */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 truncate">
                      Home Insurance
                    </span>
                    <span className="block text-[10px] sm:text-[11px] text-slate-400 truncate">
                      Est. @ {homeInsuranceRate}%/yr
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 shrink-0 text-right">
                  ${breakdown.homeInsurance.toLocaleString()}
                </span>
              </div>

              {/* Row 4: PMI */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0 ${
                      breakdown.isPmiRequired ? "bg-rose-500" : "bg-slate-300"
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 truncate">
                      Mortgage Insurance (PMI)
                    </span>
                    <span className="block text-[10px] sm:text-[11px] text-slate-400 truncate">
                      {breakdown.isPmiRequired
                        ? `Required (${downPaymentPercent}% down < 20%)`
                        : "Not required (≥20% down)"}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold shrink-0 text-right ${
                    breakdown.isPmiRequired ? "text-rose-600" : "text-slate-400"
                  }`}
                >
                  {breakdown.isPmiRequired
                    ? `$${breakdown.pmi.toLocaleString()}`
                    : "$0"}
                </span>
              </div>
            </div>

            {/* Loan Summary Stats */}
            <div className="mb-5 sm:mb-6 space-y-2 rounded-xl bg-slate-50 p-3 sm:p-4 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between gap-2 text-slate-600 min-w-0">
                <span className="truncate">Loan Principal:</span>
                <span className="font-semibold text-slate-900 shrink-0 text-right">
                  ${breakdown.loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-slate-600 min-w-0">
                <span className="truncate">Down Payment:</span>
                <span className="font-semibold text-slate-900 shrink-0 text-right">
                  ${downPayment.toLocaleString()} ({downPaymentPercent}%)
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-slate-600 min-w-0">
                <span className="truncate">Total Interest ({loanTerm} yrs):</span>
                <span className="font-semibold text-slate-900 shrink-0 text-right">
                  ${breakdown.totalInterestPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-200/70 pt-2 font-bold text-slate-900 min-w-0">
                <span className="truncate">Total Lifetime Cost:</span>
                <span className="text-blue-700 shrink-0 text-right">
                  ${breakdown.totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Callout Info Note */}
            <div className="rounded-xl bg-blue-50/60 p-3 text-[10px] sm:text-[11px] leading-relaxed text-blue-900/80 border border-blue-100">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <span>
                  Estimates are for illustrative purposes only. Taxes, insurance,
                  and interest rates may vary depending on location, credit score,
                  and lender qualifications.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MortgageCalculator;
