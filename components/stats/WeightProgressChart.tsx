import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors, Spacing, Typography } from '@/constants';
import { WeightDataPoint } from '@/lib/database/queries/exerciseStats';
import { formatChartDate } from '@/lib/utils/date';

interface WeightProgressChartProps {
  dataPoints: WeightDataPoint[];
  weightUnit: string;
}

export const WeightProgressChart = React.memo(
  ({ dataPoints, weightUnit }: WeightProgressChartProps) => {
    const { width: screenWidth } = useWindowDimensions();
    const chartWidth = screenWidth - Spacing.md * 2 - Spacing.md * 2 - 40;

    if (dataPoints.length < 2) {
      return (
        <View style={[styles.container, styles.emptyContainer]}>
          <Text style={styles.emptyText}>
            {dataPoints.length === 0
              ? 'No data for this exercise'
              : 'Complete more workouts to see progress'}
          </Text>
        </View>
      );
    }

    const labelInterval = Math.max(1, Math.ceil(dataPoints.length / 6));

    const chartData = dataPoints.map((dp, i) => ({
      value: dp.weight,
      label: i % labelInterval === 0 ? formatChartDate(dp.date) : '',
      labelTextStyle: { color: Colors.textTertiary, fontSize: 9 },
    }));

    const spacing = Math.max(
      30,
      Math.min(60, chartWidth / Math.max(dataPoints.length - 1, 1))
    );

    return (
      <View style={styles.container}>
        <LineChart
          data={chartData}
          height={180}
          width={chartWidth}
          spacing={spacing}
          initialSpacing={16}
          endSpacing={16}
          color={Colors.accent}
          thickness={2}
          dataPointsColor={Colors.accent}
          dataPointsRadius={4}
          curved
          areaChart
          startFillColor="rgba(192, 192, 192, 0.15)"
          endFillColor="rgba(192, 192, 192, 0.01)"
          noOfSections={4}
          yAxisColor={Colors.border}
          xAxisColor={Colors.border}
          yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textTertiary, fontSize: 9 }}
          rulesType="dashed"
          rulesColor={Colors.bgElevated}
          yAxisLabelSuffix={` ${weightUnit}`}
          hideRules={false}
          isAnimated
          animateOnDataChange
          onDataChangeAnimationDuration={300}
          pointerConfig={{
            pointerStripColor: Colors.textTertiary,
            pointerStripWidth: 1,
            pointerColor: Colors.accent,
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 40,
            pointerLabelComponent: (items: { value: number }[]) => (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  {items[0]?.value} {weightUnit}
                </Text>
              </View>
            ),
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
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
  tooltip: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tooltipText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
});
