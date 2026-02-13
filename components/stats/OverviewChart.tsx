import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';
import { StatsLineChart } from './StatsLineChart';
import { OverviewDataPoint } from '@/lib/database/queries/exerciseStats';
import { formatDuration } from '@/lib/utils/date';

export type OverviewMetric = 'duration' | 'volume' | 'reps' | 'sets';

const METRICS: { key: OverviewMetric; label: string }[] = [
  { key: 'duration', label: 'Time' },
  { key: 'volume', label: 'Volume' },
  { key: 'reps', label: 'Reps' },
  { key: 'sets', label: 'Sets' },
];

interface OverviewChartProps {
  metric: OverviewMetric;
  dataPoints: OverviewDataPoint[];
  weightUnit: string;
  onMetricChange: (metric: OverviewMetric) => void;
}

const getChartConfig = (metric: OverviewMetric, weightUnit: string) => {
  switch (metric) {
    case 'duration':
      return {
        data: null as OverviewDataPoint[] | null,
        yAxisSuffix: 'm',
        tooltipFormatter: (v: number) => formatDuration(v),
      };
    case 'volume':
      return {
        data: null,
        yAxisSuffix: ` ${weightUnit}`,
        tooltipFormatter: (v: number) => `${Math.round(v).toLocaleString()} ${weightUnit}`,
      };
    case 'reps':
      return {
        data: null,
        yAxisSuffix: '',
        tooltipFormatter: (v: number) => `${v} reps`,
      };
    case 'sets':
      return {
        data: null,
        yAxisSuffix: '',
        tooltipFormatter: (v: number) => `${v} sets`,
      };
  }
};

export const OverviewChart = React.memo(
  ({ metric, dataPoints, weightUnit, onMetricChange }: OverviewChartProps) => {
    const config = getChartConfig(metric, weightUnit);

    // Convert duration from seconds to minutes for chart display
    const displayData = metric === 'duration'
      ? dataPoints.map((dp) => ({ ...dp, value: Math.round(dp.value / 60) }))
      : dataPoints;

    return (
      <View>
        <View style={styles.metricRow}>
          {METRICS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.metricPill, metric === key && styles.metricPillActive]}
              onPress={() => onMetricChange(key)}
            >
              <Text style={[styles.metricText, metric === key && styles.metricTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <StatsLineChart
          dataPoints={displayData}
          yAxisSuffix={config.yAxisSuffix}
          tooltipFormatter={config.tooltipFormatter}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  metricPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
  },
  metricPillActive: {
    backgroundColor: Colors.accent,
  },
  metricText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
  metricTextActive: {
    color: Colors.accentText,
    fontWeight: Typography.fontWeight.semibold,
  },
});
