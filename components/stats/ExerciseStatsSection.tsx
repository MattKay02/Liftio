import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '@/constants';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import {
  getOverviewDuration,
  getOverviewTotalVolume,
  getOverviewTotalReps,
  getOverviewTotalSets,
  getTopExercisesByFrequency,
  OverviewDataPoint,
  ExerciseFrequencyRow,
} from '@/lib/database/queries/exerciseStats';
import { OverviewChart, OverviewMetric } from './OverviewChart';
import { TopExercisesList } from './TopExercisesList';
import { MoreExercisesDropdown } from './MoreExercisesDropdown';
import { ExerciseDetailSlideUp } from './ExerciseDetailSlideUp';

type TimeFilter = '30d' | '90d' | 'all';
const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'all', label: 'ALL' },
];

export const ExerciseStatsSection = () => {
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [overviewMetric, setOverviewMetric] = useState<OverviewMetric>('duration');
  const [overviewData, setOverviewData] = useState<OverviewDataPoint[]>([]);
  const [exerciseFrequencies, setExerciseFrequencies] = useState<ExerciseFrequencyRow[]>([]);
  const [expandedDropdown, setExpandedDropdown] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);

  const sinceTimestamp = useMemo(() => {
    if (timeFilter === 'all') return undefined;
    const days = timeFilter === '30d' ? 30 : 90;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }, [timeFilter]);

  const loadOverviewData = useCallback((metric: OverviewMetric, since?: number) => {
    switch (metric) {
      case 'duration':
        setOverviewData(getOverviewDuration(since));
        break;
      case 'volume':
        setOverviewData(getOverviewTotalVolume(since));
        break;
      case 'reps':
        setOverviewData(getOverviewTotalReps(since));
        break;
      case 'sets':
        setOverviewData(getOverviewTotalSets(since));
        break;
    }
  }, []);

  const loadStats = useCallback(() => {
    loadOverviewData(overviewMetric, sinceTimestamp);
    setExerciseFrequencies(getTopExercisesByFrequency(sinceTimestamp));
  }, [sinceTimestamp, overviewMetric, loadOverviewData]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleMetricChange = useCallback((metric: OverviewMetric) => {
    setOverviewMetric(metric);
  }, []);

  const handleExercisePress = useCallback((exerciseName: string) => {
    setSelectedExercise(exerciseName);
    setShowExerciseDetail(true);
  }, []);

  const top3 = exerciseFrequencies.slice(0, 3);
  const rest = exerciseFrequencies.slice(3);
  const hasData = exerciseFrequencies.length > 0 || overviewData.length > 0;

  if (!hasData) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Workout Stats</Text>
        <View style={styles.filterRow}>
          {FILTERS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.filterPill, timeFilter === key && styles.filterPillActive]}
              onPress={() => setTimeFilter(key)}
            >
              <Text style={[styles.filterText, timeFilter === key && styles.filterTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <OverviewChart
        metric={overviewMetric}
        dataPoints={overviewData}
        weightUnit={weightUnit}
        onMetricChange={handleMetricChange}
      />

      <TopExercisesList
        exercises={top3}
        onPressExercise={handleExercisePress}
      />

      <MoreExercisesDropdown
        exercises={rest}
        expanded={expandedDropdown}
        onToggleExpand={() => setExpandedDropdown((prev) => !prev)}
        onPressExercise={handleExercisePress}
      />

      <ExerciseDetailSlideUp
        visible={showExerciseDetail}
        exerciseName={selectedExercise}
        onClose={() => setShowExerciseDetail(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: Colors.bgElevated,
  },
  filterText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
  },
  filterTextActive: {
    color: Colors.textPrimary,
  },
});
