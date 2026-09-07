"use client";

import { CalendarDays, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import { formatCurrency } from "@/lib/format";
import type { SellerDailyRevenue } from "@/types";

const BASE_MONEY_TICKS = [0, 10_000, 50_000, 100_000, 200_000, 500_000] as const;
const CHART_WIDTH = 1120;
const CHART_HEIGHT = 340;
const PADDING = { top: 22, right: 24, bottom: 48, left: 104 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;
const MIN_MONTH = "2000-01";

interface SellerRevenueChartProps {
  month: string;
  dailyRevenue: SellerDailyRevenue[];
  totalRevenue: number;
  isLoading: boolean;
  onMonthChange: (month: string) => void;
}

function currentBusinessMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function getDaysInMonth(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function shiftMonth(monthValue: string, delta: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-");
  return `Tháng ${month}/${year}`;
}

function buildMoneyTicks(maxAmount: number): number[] {
  const ticks: number[] = [...BASE_MONEY_TICKS];
  if (maxAmount <= ticks[ticks.length - 1]) return ticks;

  let magnitude = 1_000_000;
  const factors = [1, 2, 5];
  while (ticks[ticks.length - 1] < maxAmount) {
    for (const factor of factors) {
      const value = magnitude * factor;
      if (value > ticks[ticks.length - 1]) ticks.push(value);
      if (value >= maxAmount) return ticks;
    }
    magnitude *= 10;
  }
  return ticks;
}

function formatMoneyTick(value: number) {
  if (value === 0) return "0đ";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(millions)}tr`;
  }
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function amountToY(amount: number, ticks: number[]) {
  const maximum = ticks[ticks.length - 1] ?? 500_000;
  const clampedAmount = Math.min(Math.max(amount, 0), maximum);
  let segmentIndex = 0;

  for (let index = 0; index < ticks.length - 1; index += 1) {
    if (clampedAmount >= ticks[index] && clampedAmount <= ticks[index + 1]) {
      segmentIndex = index;
      break;
    }
  }

  const segmentStart = ticks[segmentIndex];
  const segmentEnd = ticks[segmentIndex + 1];
  const segmentProgress = segmentEnd === segmentStart
    ? 0
    : (clampedAmount - segmentStart) / (segmentEnd - segmentStart);
  const normalizedPosition = (segmentIndex + segmentProgress) / (ticks.length - 1);

  return PADDING.top + (1 - normalizedPosition) * PLOT_HEIGHT;
}

export function SellerRevenueChart({
  month,
  dailyRevenue,
  totalRevenue,
  isLoading,
  onMonthChange,
}: SellerRevenueChartProps) {
  const currentMonth = currentBusinessMonth();
  const daysInMonth = getDaysInMonth(month);
  const visibleRevenue = useMemo(() => {
    const amountByDay = new Map(dailyRevenue.map((item) => [item.day, item.amount]));
    return Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      amount: amountByDay.get(index + 1) ?? 0,
    }));
  }, [dailyRevenue, daysInMonth]);
  const moneyTicks = useMemo(
    () => buildMoneyTicks(Math.max(0, ...visibleRevenue.map((item) => item.amount))),
    [visibleRevenue],
  );
  const dailyAverage = visibleRevenue.length ? Math.round(totalRevenue / visibleRevenue.length) : 0;
  const points = visibleRevenue
    .map((item, index) => {
      const x = PADDING.left + (index / Math.max(visibleRevenue.length - 1, 1)) * PLOT_WIDTH;
      return `${x},${amountToY(item.amount, moneyTicks)}`;
    })
    .join(" ");

  const canMovePrevious = month > MIN_MONTH;
  const canMoveNext = month < currentMonth;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-800">
            <span className="size-2 rounded-full bg-violet-600" />
            Doanh thu theo ngày
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {formatMonthLabel(month)} · ngày 01–{daysInMonth} · đơn vị VNĐ
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <div className="rounded-xl bg-violet-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">Tổng tháng</p>
            <p className="mt-0.5 text-sm font-extrabold text-violet-800">
              {isLoading ? "—" : formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
              <TrendingUp className="size-3" /> Trung bình/ngày
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-emerald-800">
              {isLoading ? "—" : formatCurrency(dailyAverage)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-5">
        <div className="min-w-[980px]">
          {isLoading ? (
            <div className="h-[340px] animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-[340px] w-full"
              role="img"
              aria-label={`Biểu đồ doanh thu từng ngày từ ngày 1 đến ngày ${daysInMonth} của ${formatMonthLabel(month)}`}
            >
              <defs>
                <linearGradient id="seller-daily-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {moneyTicks.map((tick, index) => {
                const normalizedPosition = index / (moneyTicks.length - 1);
                const y = PADDING.top + (1 - normalizedPosition) * PLOT_HEIGHT;

                return (
                  <g key={tick}>
                    <line
                      x1={PADDING.left}
                      y1={y}
                      x2={CHART_WIDTH - PADDING.right}
                      y2={y}
                      stroke="#dbe3ee"
                      strokeDasharray={tick === 0 ? undefined : "4 6"}
                    />
                    <text
                      x={PADDING.left - 12}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[11px] font-semibold"
                    >
                      {formatMoneyTick(tick)}
                    </text>
                  </g>
                );
              })}

              {visibleRevenue.map((item, index) => {
                const x = PADDING.left + (index / Math.max(visibleRevenue.length - 1, 1)) * PLOT_WIDTH;
                return (
                  <line
                    key={`vertical-${item.day}`}
                    x1={x}
                    y1={PADDING.top}
                    x2={x}
                    y2={CHART_HEIGHT - PADDING.bottom}
                    stroke="#eef2f7"
                  />
                );
              })}

              <polygon
                points={`${PADDING.left},${CHART_HEIGHT - PADDING.bottom} ${points} ${CHART_WIDTH - PADDING.right},${CHART_HEIGHT - PADDING.bottom}`}
                fill="url(#seller-daily-revenue-fill)"
              />
              <polyline
                points={points}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              {visibleRevenue.map((item, index) => {
                const x = PADDING.left + (index / Math.max(visibleRevenue.length - 1, 1)) * PLOT_WIDTH;
                const y = amountToY(item.amount, moneyTicks);

                return (
                  <g key={`point-${item.day}`}>
                    <circle cx={x} cy={y} r="4" fill="white" stroke="#7c3aed" strokeWidth="2.5">
                      <title>Ngày {String(item.day).padStart(2, "0")}: {formatCurrency(item.amount)}</title>
                    </circle>
                    <text
                      x={x}
                      y={CHART_HEIGHT - 20}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px] font-semibold"
                    >
                      {String(item.day).padStart(2, "0")}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-center">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          disabled={!canMovePrevious || isLoading}
          className="hidden size-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 sm:grid"
          aria-label="Xem tháng trước"
        >
          <ChevronLeft className="size-4" />
        </button>

        <label className="w-full max-w-xs text-xs font-bold uppercase tracking-wide text-slate-500">
          Chọn tháng
          <span className="relative mt-1.5 block">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-violet-600" />
            <input
              type="month"
              min={MIN_MONTH}
              max={currentMonth}
              value={month}
              onChange={(event) => {
                if (event.target.value) onMonthChange(event.target.value);
              }}
              disabled={isLoading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-wait disabled:bg-slate-50"
            />
          </span>
        </label>

        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          disabled={!canMoveNext || isLoading}
          className="hidden size-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 sm:grid"
          aria-label="Xem tháng sau"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
