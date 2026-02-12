import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface ExercisePickerProps {
  exerciseNames: string[];
  selectedExercise: string;
  onSelectExercise: (name: string) => void;
}

export const ExercisePicker = React.memo(
  ({ exerciseNames, selectedExercise, onSelectExercise }: ExercisePickerProps) => {
    if (exerciseNames.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {exerciseNames.map((name) => {
          const isSelected = name === selectedExercise;
          return (
            <Pressable
              key={name}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelectExercise(name)}
            >
              <Text
                style={[styles.pillText, isSelected && styles.pillTextSelected]}
                numberOfLines={1}
              >
                {name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  content: {
    gap: Spacing.sm,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
  },
  pillSelected: {
    backgroundColor: Colors.accent,
  },
  pillText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
  pillTextSelected: {
    color: Colors.accentText,
    fontWeight: Typography.fontWeight.semibold,
  },
});
