"use client";

import { cn } from "@/lib/cn";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  className,
}: SliderProps) {
  const display = formatValue ? formatValue(value) : String(value);

  return (
    <label className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium text-slate-100 sm:text-sm">
          {label}
        </span>
        <span className="font-mono text-[12px] tabular-nums text-slate-300 sm:text-[13px]">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-2.5 w-full cursor-pointer appearance-none rounded-full border border-white/8 bg-white/12",
          "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-300",
          "[&::-webkit-slider-thumb]:shadow-[0_0_0_6px_rgba(139,107,62,0.12)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50",
        )}
      />
    </label>
  );
}
