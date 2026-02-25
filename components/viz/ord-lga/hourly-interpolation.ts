import { OrdDerivedDay } from "./transforms";

/**
 * Phase 1: Engine Refactor
 * This WebWorker task massively expands the 91-day data into hourly data points
 * to support the 50,000-point WebGL scatter plot and point clouds.
 */
export function buildHourlyInterpolation(rows: OrdDerivedDay[]) {
    const hourlyData = [];

    for (let i = 0; i < rows.length - 1; i++) {
        const current = rows[i];
        const next = rows[i + 1];

        if (!current || !next) continue;

        // Linearly interpolate 24 hours between current day and next day
        for (let h = 0; h < 24; h++) {
            const progress = h / 24;

            hourlyData.push({
                id: `${current.date}-${h}`,
                dayIndex: current.index,
                hour: h,
                timestamp: new Date(`${current.date}T${h.toString().padStart(2, '0')}:00:00`).getTime(),
                price: current.actualPrice + progress * (next.actualPrice - current.actualPrice),
                policyPrice: current.policyPrice + progress * (next.policyPrice - current.policyPrice),
                competitorPrice: current.competitorPrice + progress * (next.competitorPrice - current.competitorPrice),
                revenue: (current.actualRevenue + progress * (next.actualRevenue - current.actualRevenue)) / 24,
                policyRevenue: (current.policyRevenue + progress * (next.policyRevenue - current.policyRevenue)) / 24,
                shock: current.shock + progress * (next.shock - current.shock),
                isAnomaly: Math.random() > 0.98 // Procedural anomaly generation for 3D pulsing
            });
        }
    }

    return hourlyData;
}

export type HourlyDataPoint = ReturnType<typeof buildHourlyInterpolation>[number];
