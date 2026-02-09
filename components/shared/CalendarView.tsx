import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants';
import { WorkoutWithExercises } from '@/types/workout';

interface CalendarViewProps {
  workouts: (WorkoutWithExercises & { date: number })[];
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

export const CalendarView = ({ workouts, onSelectDate, selectedDate }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWorkoutsForDate = (day: number) => {
    const dateTime = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateKey = dateTime.toDateString();
    return workouts.filter((w) => new Date(w.date).toDateString() === dateKey);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <Pressable onPress={handlePrevMonth}>
          <ChevronLeft size={24} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <Pressable onPress={handleNextMonth}>
          <ChevronRight size={24} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Day Labels */}
      <View style={styles.dayLabelsRow}>
        {dayLabels.map((label) => (
          <Text key={label} style={styles.dayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dayWorkouts = getWorkoutsForDate(day);
          const isToday =
            new Date().toDateString() ===
            new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
          const isSelected =
            selectedDate?.toDateString() ===
            new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

          return (
            <Pressable
              key={day}
              style={[styles.dayCell, isToday && styles.todayCell, isSelected && styles.selectedCell]}
              onPress={() =>
                onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
              }
            >
              <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>{day}</Text>
              {dayWorkouts.length > 0 && (
                <View style={styles.workoutIndicator}>
                  <View style={styles.highlightCircle} />
                  <Text style={styles.workoutName}>{dayWorkouts[0].name.substring(0, 8)}</Text>
                  {dayWorkouts.length > 1 && (
                    <Text style={styles.badgeText}>+{dayWorkouts.length - 1}</Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingTop: 4,
  },
  todayCell: {
    borderColor: Colors.border,
    borderWidth: 1,
  },
  selectedCell: {
    backgroundColor: Colors.bgCard,
  },
  dayNumber: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  selectedDayNumber: {
    fontWeight: '600',
  },
  workoutIndicator: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: 4,
  },
  highlightCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.highlight,
  },
  workoutName: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 1,
    textAlign: 'center',
    maxWidth: '100%',
  },
  badgeText: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 1,
  },
});
