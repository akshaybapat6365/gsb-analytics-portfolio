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
    <label className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-slate-200">{label}</span>
        <span className="font-sans text-xs tabular-nums text-slate-400">
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
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10",
          "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300",
          "[&::-webkit-slider-thumb]:shadow-[0_0_0_6px_rgba(34,211,238,0.12)]",
        )}
      />
    </label>
  );
}
