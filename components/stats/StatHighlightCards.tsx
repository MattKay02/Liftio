import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';
import { ExerciseFrequency, HighestVolumeSet, HighestWeightSet } from '@/lib/database/queries/exerciseStats';
import { formatWeight } from '@/lib/utils/date';

interface StatHighlightCardsProps {
  mostFrequent: ExerciseFrequency | null;
  highestVolume: HighestVolumeSet | null;
  highestWeight: HighestWeightSet | null;
  weightUnit: string;
}

export const StatHighlightCards = React.memo(
  ({ mostFrequent, highestVolume, highestWeight, weightUnit }: StatHighlightCardsProps) => {
    return (
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.label}>Most Frequent</Text>
          <Text style={styles.value} numberOfLines={1}>
            {mostFrequent?.exerciseName ?? '—'}
          </Text>
          <Text style={styles.detail}>
            {mostFrequent ? `${mostFrequent.workoutCount} workout${mostFrequent.workoutCount !== 1 ? 's' : ''}` : '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Highest Volume</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {highestVolume ? formatWeight(highestVolume.volume, weightUnit) : '—'}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            {highestVolume ? `${highestVolume.reps}x${highestVolume.weight} ${highestVolume.exerciseName}` : '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Heaviest Lift</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {highestWeight ? formatWeight(highestWeight.weight, weightUnit) : '—'}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            {highestWeight?.exerciseName ?? '—'}
          </Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
  },
  label: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  detail: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
});
