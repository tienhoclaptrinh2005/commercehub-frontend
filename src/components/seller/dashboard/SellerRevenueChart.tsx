"use client";

import { CalendarDays, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";

const MONTH_OPTIONS = [
  { value: "2026-08", label: "Tháng 08/2026", seed: 8 },
  { value: "2026-07", label: "Tháng 07/2026", seed: 7 },
  { value: "2026-06", label: "Tháng 06/2026", seed: 6 },
  { value: "2026-05", label: "Tháng 05/2026", seed: 5 },
  { value: "2026-04", label: "Tháng 04/2026", seed: 4 },
  { value: "2026-03", label: "Tháng 03/2026", seed: 3 },
  { value: "2026-02", label: "Tháng 02/2026", seed: 2 },
] as const;

const MONEY_TICKS = [0, 10_000, 50_000, 100_000, 200_000, 500_000] as const;
const CHART_WIDTH = 960;
const CHART_HEIGHT = 320;
const PADDING = { top: 22, right: 24, bottom: 46, left: 92 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

type MonthHalf = "first" | "second";

interface DailyRevenue {
  day: number;
  amount: number;
}

function getDaysInMonth(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function createMockDailyRevenue(daysInMonth: number, seed: number): DailyRevenue[] {
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;

    if ((day + seed) % 9 === 0) {
      return { day, amount: 0 };
    }

    const rawAmount = 10_000 + ((day * 73_000 + seed * 41_000) % 470_000);
    return {
      day,
      amount: Math.min(500_000, Math.round(rawAmount / 10_000) * 10_000),
    };
  });
}

function formatMoneyTick(value: number) {
  if (value === 0) return "0đ";
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function amountToY(amount: number) {
  const clampedAmount = Math.min(Math.max(amount, MONEY_TICKS[0]), MONEY_TICKS.at(-1) ?? 500_000);
  let segmentIndex = 0;

  for (let index = 0; index < MONEY_TICKS.length - 1; index += 1) {
    if (clampedAmount >= MONEY_TICKS[index] && clampedAmount <= MONEY_TICKS[index + 1]) {
      segmentIndex = index;
      break;
    }
  }

  const segmentStart = MONEY_TICKS[segmentIndex];
  const segmentEnd = MONEY_TICKS[segmentIndex + 1];
  const segmentProgress =
    segmentEnd === segmentStart ? 0 : (clampedAmount - segmentStart) / (segmentEnd - segmentStart);
  const normalizedPosition =
    (segmentIndex + segmentProgress) / (MONEY_TICKS.length - 1);

  return PADDING.top + (1 - normalizedPosition) * PLOT_HEIGHT;
}

export function SellerRevenueChart() {
  const [selectedMonth, setSelectedMonth] = useState<(typeof MONTH_OPTIONS)[number]["value"]>(
    MONTH_OPTIONS[0].value,
  );
  const [selectedHalf, setSelectedHalf] = useState<MonthHalf>("first");

  const selectedMonthIndex = MONTH_OPTIONS.findIndex((month) => month.value === selectedMonth);
  const monthOption = MONTH_OPTIONS[selectedMonthIndex] ?? MONTH_OPTIONS[0];
  const daysInMonth = getDaysInMonth(monthOption.value);

  const visibleRevenue = useMemo(() => {
    const allDays = createMockDailyRevenue(daysInMonth, monthOption.seed);
    return selectedHalf === "first" ? allDays.slice(0, 15) : allDays.slice(15);
  }, [daysInMonth, monthOption.seed, selectedHalf]);

  const rangeStart = selectedHalf === "first" ? 1 : 16;
  const rangeEnd = selectedHalf === "first" ? 15 : daysInMonth;
  const periodTotal = visibleRevenue.reduce((total, item) => total + item.amount, 0);
  const dailyAverage = visibleRevenue.length ? Math.round(periodTotal / visibleRevenue.length) : 0;

  const points = visibleRevenue
    .map((item, index) => {
      const x =
        PADDING.left +
        (index / Math.max(visibleRevenue.length - 1, 1)) * PLOT_WIDTH;
      return `${x},${amountToY(item.amount)}`;
    })
    .join(" ");

  const moveRange = (direction: "previous" | "next") => {
    if (direction === "previous") {
      if (selectedHalf === "second") {
        setSelectedHalf("first");
        return;
      }

      const olderMonth = MONTH_OPTIONS[selectedMonthIndex + 1];
      if (olderMonth) {
        setSelectedMonth(olderMonth.value);
        setSelectedHalf("second");
      }
      return;
    }

    if (selectedHalf === "first") {
      setSelectedHalf("second");
      return;
    }

    const newerMonth = MONTH_OPTIONS[selectedMonthIndex - 1];
    if (newerMonth) {
      setSelectedMonth(newerMonth.value);
      setSelectedHalf("first");
    }
  };

  const canMovePrevious = selectedHalf === "second" || selectedMonthIndex < MONTH_OPTIONS.length - 1;
  const canMoveNext = selectedHalf === "first" || selectedMonthIndex > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-800">
            <span className="size-2 rounded-full bg-violet-600" />
            Doanh thu theo ngày
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {monthOption.label} · ngày {String(rangeStart).padStart(2, "0")}–
            {String(rangeEnd).padStart(2, "0")} · đơn vị VNĐ
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <div className="rounded-xl bg-violet-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">Tổng kỳ</p>
            <p className="mt-0.5 text-sm font-extrabold text-violet-800">{formatCurrency(periodTotal)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
              <TrendingUp className="size-3" /> Trung bình/ngày
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-emerald-800">{formatCurrency(dailyAverage)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-5">
        <div className="min-w-[760px]">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-[320px] w-full"
            role="img"
            aria-label={`Biểu đồ doanh thu từng ngày từ ngày ${rangeStart} đến ngày ${rangeEnd} của ${monthOption.label}`}
          >
            <defs>
              <linearGradient id="seller-daily-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {MONEY_TICKS.map((tick, index) => {
              const normalizedPosition = index / (MONEY_TICKS.length - 1);
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
              const x =
                PADDING.left +
                (index / Math.max(visibleRevenue.length - 1, 1)) * PLOT_WIDTH;

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
              const x =
                PADDING.left +
                (index / Math.max(visibleRevenue.length - 1, 1)) * PLOT_WIDTH;
              const y = amountToY(item.amount);

              return (
                <g key={`point-${item.day}`}>
                  <circle cx={x} cy={y} r="5" fill="white" stroke="#7c3aed" strokeWidth="3">
                    <title>
                      Ngày {String(item.day).padStart(2, "0")}: {formatCurrency(item.amount)}
                    </title>
                  </circle>
                  <text
                    x={x}
                    y={CHART_HEIGHT - 20}
                    textAnchor="middle"
                    className="fill-slate-500 text-[11px] font-semibold"
                  >
                    {String(item.day).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 lg:grid-cols-[auto_minmax(210px,260px)_minmax(320px,1fr)_auto] lg:items-end">
        <button
          type="button"
          onClick={() => moveRange("previous")}
          disabled={!canMovePrevious}
          className="hidden size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 lg:grid"
          aria-label="Xem khoảng ngày trước"
        >
          <ChevronLeft className="size-4" />
        </button>

        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Tháng
          <span className="relative mt-1.5 block">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-violet-600" />
            <select
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value as (typeof MONTH_OPTIONS)[number]["value"]);
                setSelectedHalf("first");
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Khoảng ngày</p>
          <div className="mt-1.5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSelectedHalf("first")}
              className={`h-9 rounded-lg px-3 text-sm font-bold transition ${
                selectedHalf === "first"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Ngày 01–15
            </button>
            <button
              type="button"
              onClick={() => setSelectedHalf("second")}
              className={`h-9 rounded-lg px-3 text-sm font-bold transition ${
                selectedHalf === "second"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Ngày 16–{daysInMonth}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => moveRange("next")}
          disabled={!canMoveNext}
          className="hidden size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 lg:grid"
          aria-label="Xem khoảng ngày tiếp theo"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
