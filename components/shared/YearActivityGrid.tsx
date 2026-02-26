import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors, Spacing } from '@/constants';
import { WorkoutWithExercises } from '@/types/workout';

interface YearActivityGridProps {
  workouts: (WorkoutWithExercises & { date: number })[];
}

const WEEKS = 52;
const DAYS_PER_WEEK = 7;
const SQUARE_GAP = 2;
const MONTH_LABEL_HEIGHT = 14;

// 5 tiers, evenly spread 40% → 100%
const TIER_OPACITIES = [0.40, 0.55, 0.70, 0.85, 1.0] as const;

function getTierOpacity(duration: number, avg: number, max: number): number {
  if (avg === 0 || max === 0 || max <= avg) return TIER_OPACITIES[4];

  const midBelowAvg = avg / 2;
  const midAboveAvg = avg + (max - avg) / 2;

  if (duration >= max) return TIER_OPACITIES[4];         // Tier 5 — at/above max
  if (duration >= midAboveAvg) return TIER_OPACITIES[3]; // Tier 4 — lower above avg
  if (duration >= avg) return TIER_OPACITIES[2];         // Tier 3 — at average
  if (duration >= midBelowAvg) return TIER_OPACITIES[1]; // Tier 2 — upper below avg
  return TIER_OPACITIES[0];                              // Tier 1 — lowest below avg
}

export const YearActivityGrid = ({ workouts }: YearActivityGridProps) => {
  const { width } = useWindowDimensions();

  // Screen - outer padding (16 each side) - card padding (16 each side)
  const availableWidth = width - 16 * 4;
  const squareSize = (availableWidth - (WEEKS - 1) * SQUARE_GAP) / WEEKS;

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find Monday of the current week
    const dow = (today.getDay() + 6) % 7; // Mon=0, ..., Sun=6
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - dow);

    // Grid starts at the Monday 51 weeks before the current Monday (52 columns total)
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() - (WEEKS - 1) * 7);

    // Build per-date duration map scoped to the visible 52-week window only.
    // Workouts outside the window are excluded so avg/max reflect the current period.
    // null = workout exists but no valid duration recorded
    const windowStart = startDate.getTime();
    const windowEnd = today.getTime();
    const durationByDate = new Map<string, number | null>();
    workouts.forEach((w) => {
      const ts = new Date(w.date).setHours(0, 0, 0, 0);
      if (ts < windowStart || ts > windowEnd) return;
      const key = new Date(ts).toDateString();
      if (w.duration !== null && w.duration > 0) {
        durationByDate.set(key, (durationByDate.get(key) ?? 0) + w.duration);
      } else if (!durationByDate.has(key)) {
        durationByDate.set(key, null);
      }
    });

    // Compute median and 95th-percentile ceiling across days with valid durations.
    // Median is resistant to a few unusually long/short sessions skewing the midpoint.
    // 95th percentile avoids a single freak session compressing every other day into low tiers.
    const validDurations: number[] = [];
    durationByDate.forEach((dur) => {
      if (dur !== null && dur > 0) validDurations.push(dur);
    });
    validDurations.sort((a, b) => a - b);

    const n = validDurations.length;
    const avgDuration =
      n > 0
        ? n % 2 === 1
          ? validDurations[Math.floor(n / 2)]
          : (validDurations[n / 2 - 1] + validDurations[n / 2]) / 2
        : 0;
    const maxDuration =
      n > 0 ? validDurations[Math.min(Math.ceil(n * 0.95) - 1, n - 1)] : 0;

    // squareOpacity: null → grey (no workout or no duration), number → white at that opacity
    type DayData = { date: Date; isFuture: boolean; squareOpacity: number | null };
    const weeksData: DayData[][] = [];
    const cursor = new Date(startDate);

    for (let w = 0; w < WEEKS; w++) {
      const week: DayData[] = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const date = new Date(cursor);
        const isFuture = date > today;
        const key = date.toDateString();
        let squareOpacity: number | null = null;

        if (!isFuture && durationByDate.has(key)) {
          const dur = durationByDate.get(key)!;
          if (dur !== null && dur > 0) {
            squareOpacity = getTierOpacity(dur, avgDuration, maxDuration);
          }
          // dur === null → no duration → squareOpacity stays null (grey)
        }

        week.push({ date, isFuture, squareOpacity });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeksData.push(week);
    }

    // Build month labels: one per month at the first week containing that month
    const labels: { label: string; weekIndex: number }[] = [];
    const seen = new Set<string>();
    for (let w = 0; w < weeksData.length; w++) {
      for (const { date } of weeksData[w]) {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!seen.has(key)) {
          seen.add(key);
          labels.push({
            label: date.toLocaleString('default', { month: 'short' }),
            weekIndex: w,
          });
          break;
        }
      }
    }

    return { weeks: weeksData, monthLabels: labels };
  }, [workouts]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.card}>
        {/* Month labels */}
        <View style={[styles.monthRow, { height: MONTH_LABEL_HEIGHT }]}>
          {monthLabels.map((ml, i) => (
            <Text
              key={i}
              style={[styles.monthLabel, { left: ml.weekIndex * (squareSize + SQUARE_GAP) }]}
            >
              {ml.label}
            </Text>
          ))}
        </View>

        {/* Grid: columns = weeks (left = oldest), rows = days Mon–Sun */}
        <View style={styles.grid}>
          {weeks.map((week, wIdx) => (
            <View
              key={wIdx}
              style={{ marginRight: wIdx < WEEKS - 1 ? SQUARE_GAP : 0 }}
            >
              {week.map(({ squareOpacity, isFuture }, dIdx) => {
                let bgColor: string;
                if (isFuture) {
                  bgColor = 'transparent';
                } else if (squareOpacity !== null) {
                  bgColor = `rgba(255, 255, 255, ${squareOpacity})`;
                } else {
                  bgColor = Colors.bgElevated;
                }

                return (
                  <View
                    key={dIdx}
                    style={{
                      width: squareSize,
                      height: squareSize,
                      borderRadius: 1,
                      marginBottom: dIdx < DAYS_PER_WEEK - 1 ? SQUARE_GAP : 0,
                      backgroundColor: bgColor,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.md,
  },
  monthRow: {
    position: 'relative',
    marginBottom: 4,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
  },
});
