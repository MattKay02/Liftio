import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '@/constants';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import {
  getMostFrequentExercise,
  getHighestVolumeSet,
  getHighestWeightLifted,
  getPerformedExerciseNames,
  getWeightOverTime,
  ExerciseFrequency,
  HighestVolumeSet,
  HighestWeightSet,
  WeightDataPoint,
} from '@/lib/database/queries/exerciseStats';
import { StatHighlightCards } from './StatHighlightCards';
import { ExercisePicker } from './ExercisePicker';
import { WeightProgressChart } from './WeightProgressChart';

type TimeFilter = '30d' | '90d' | 'all';
const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'all', label: 'ALL' },
];

export const ExerciseStatsSection = () => {
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [mostFrequent, setMostFrequent] = useState<ExerciseFrequency | null>(null);
  const [highestVolume, setHighestVolume] = useState<HighestVolumeSet | null>(null);
  const [highestWeight, setHighestWeight] = useState<HighestWeightSet | null>(null);
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState<WeightDataPoint[]>([]);

  const sinceTimestamp = useMemo(() => {
    if (timeFilter === 'all') return undefined;
    const days = timeFilter === '30d' ? 30 : 90;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }, [timeFilter]);

  const loadStats = useCallback(() => {
    const freq = getMostFrequentExercise(sinceTimestamp);
    setMostFrequent(freq);
    setHighestVolume(getHighestVolumeSet(sinceTimestamp));
    setHighestWeight(getHighestWeightLifted(sinceTimestamp));

    const names = getPerformedExerciseNames(sinceTimestamp);
    setExerciseNames(names);

    const defaultExercise = freq?.exerciseName ?? names[0] ?? '';
    setSelectedExercise((prev) => {
      if (prev && names.includes(prev)) return prev;
      return defaultExercise;
    });

    if (defaultExercise) {
      setChartData(getWeightOverTime(defaultExercise, sinceTimestamp));
    } else {
      setChartData([]);
    }
  }, [sinceTimestamp]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  useEffect(() => {
    if (selectedExercise) {
      setChartData(getWeightOverTime(selectedExercise, sinceTimestamp));
    } else {
      setChartData([]);
    }
  }, [selectedExercise, sinceTimestamp]);

  if (!mostFrequent && !highestVolume && !highestWeight) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Exercise Stats</Text>
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

      <StatHighlightCards
        mostFrequent={mostFrequent}
        highestVolume={highestVolume}
        highestWeight={highestWeight}
        weightUnit={weightUnit}
      />

      <ExercisePicker
        exerciseNames={exerciseNames}
        selectedExercise={selectedExercise}
        onSelectExercise={setSelectedExercise}
      />

      <WeightProgressChart dataPoints={chartData} weightUnit={weightUnit} />
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
