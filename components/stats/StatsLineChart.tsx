import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors, Spacing, Typography } from '@/constants';
import { formatChartDate } from '@/lib/utils/date';
import { OverviewDataPoint } from '@/lib/database/queries/exerciseStats';

interface StatsLineChartProps {
  dataPoints: OverviewDataPoint[];
  yAxisSuffix?: string;
  tooltipFormatter?: (value: number) => string;
}

export const StatsLineChart = React.memo(
  ({ dataPoints, yAxisSuffix = '' }: StatsLineChartProps) => {
    const { width: screenWidth } = useWindowDimensions();
    const chartWidth = screenWidth - Spacing.md * 2 - Spacing.md * 2 - 40;

    if (dataPoints.length < 2) {
      return (
        <View style={[styles.container, styles.emptyContainer]}>
          <Text style={styles.emptyText}>
            {dataPoints.length === 0
              ? 'No data yet'
              : 'Complete more workouts to see progress'}
          </Text>
        </View>
      );
    }

    // Evenly sample down to max 9 display points
    const MAX_DISPLAY_POINTS = 9;
    const displayData = dataPoints.length <= MAX_DISPLAY_POINTS
      ? dataPoints
      : Array.from({ length: MAX_DISPLAY_POINTS }, (_, i) => {
          const idx = Math.round(i * (dataPoints.length - 1) / (MAX_DISPLAY_POINTS - 1));
          return dataPoints[idx];
        });

    // Up to 5 evenly-spaced x-axis label indices.
    // Math.floor for all interior positions so any remainder gap falls at the end.
    const labelCount = Math.min(5, displayData.length);
    const lastIdx = displayData.length - 1;
    const labelledIndices = new Set(
      Array.from({ length: labelCount }, (_, i) => {
        if (i === labelCount - 1) return lastIdx;
        return Math.floor(i * lastIdx / (labelCount - 1));
      })
    );

    const chartData = displayData.map((dp, i) => ({
      value: dp.value,
      label: labelledIndices.has(i) ? formatChartDate(dp.date) : '',
      labelTextStyle: { color: Colors.textTertiary, fontSize: 9 },
    }));

    const EDGE_PADDING = 20;
    const spacing = (chartWidth - EDGE_PADDING * 2) / Math.max(displayData.length - 1, 1);

    const average = displayData.reduce((sum, dp) => sum + dp.value, 0) / displayData.length;
    const avgLabel = `avg ${Math.round(average)}${yAxisSuffix}`;

    return (
      <View style={styles.container}>
        <LineChart
          data={chartData}
          height={180}
          width={chartWidth}
          spacing={spacing}
          initialSpacing={EDGE_PADDING}
          endSpacing={EDGE_PADDING}
          color={Colors.accent}
          thickness={2}
          dataPointsColor={Colors.accent}
          dataPointsRadius={4}
          curved
          noOfSections={4}
          yAxisColor={Colors.border}
          xAxisColor={Colors.border}
          yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textTertiary, fontSize: 9 }}
          yAxisLabelSuffix={yAxisSuffix}
          disableScroll
          hideRules
          isAnimated
          animateOnDataChange
          onDataChangeAnimationDuration={300}
          showReferenceLine1
          referenceLine1Position={average}
          referenceLine1Config={{
            color: Colors.highlight,
            thickness: 1,
            type: 'dashed',
            dashWidth: 6,
            dashGap: 4,
            labelText: avgLabel,
            labelTextStyle: { color: Colors.highlight, fontSize: 9 },
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  emptyContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
