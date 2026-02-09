import React, { useState, useCallback } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants';
import { Header } from '@/components/shared/Header';
import { CalendarView } from '@/components/shared/CalendarView';
import { WorkoutDetailSlideUp } from '@/components/shared/WorkoutDetailSlideUp';
import { SettingsMenu } from '@/components/shared/SettingsMenu';
import { WorkoutWithExercises } from '@/types/workout';
import { getAllWorkouts } from '@/lib/database/queries/workouts';

export default function LogsScreen() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [workouts, setWorkouts] = useState<(WorkoutWithExercises & { date: number })[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithExercises | null>(null);
  const [showDetailSlideUp, setShowDetailSlideUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = () => {
    try {
      const allWorkouts = getAllWorkouts();
      setWorkouts(allWorkouts);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    }
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const dateKey = date.toDateString();
    const workoutsForDate = workouts.filter(
      (w) => new Date(w.date).toDateString() === dateKey
    );

    if (workoutsForDate.length > 0) {
      setSelectedWorkout(workoutsForDate[0]);
      setShowDetailSlideUp(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showSettings={true} onSettingsPress={() => setShowSettings(true)} />

      <View style={styles.container}>
        <CalendarView
          workouts={workouts}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
        />
      </View>

      <WorkoutDetailSlideUp
        visible={showDetailSlideUp}
        workout={selectedWorkout}
        onClose={() => setShowDetailSlideUp(false)}
      />

      <SettingsMenu
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
