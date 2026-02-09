import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, PanResponder, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing } from '@/constants';
import { WorkoutWithExercises } from '@/types/workout';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = 16;
const GRID_GAP = 4;
const CELL_WIDTH = (SCREEN_WIDTH - CALENDAR_PADDING * 2 - Spacing.md * 2 - GRID_GAP * 6) / 7;

interface CalendarViewProps {
  workouts: (WorkoutWithExercises & { date: number })[];
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

export const CalendarView = ({ workouts, onSelectDate, selectedDate }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const now = new Date();
  const currentMonthLimit = new Date(now.getFullYear(), now.getMonth(), 1);

  const earliestMonth = useMemo(() => {
    if (workouts.length === 0) return currentMonthLimit;
    const earliest = Math.min(...workouts.map((w) => w.date));
    const d = new Date(earliest);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [workouts]);

  const canGoBack =
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime() >
    earliestMonth.getTime();
  const canGoForward =
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime() <
    currentMonthLimit.getTime();

  const canGoBackRef = useRef(canGoBack);
  const canGoForwardRef = useRef(canGoForward);
  const earliestMonthRef = useRef(earliestMonth);
  const currentMonthLimitRef = useRef(currentMonthLimit);
  canGoBackRef.current = canGoBack;
  canGoForwardRef.current = canGoForward;
  earliestMonthRef.current = earliestMonth;
  currentMonthLimitRef.current = currentMonthLimit;

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
    if (!canGoBack) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    if (!canGoForward) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 20
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50 && canGoBackRef.current) {
          setCurrentMonth((prev) => {
            const next = new Date(prev.getFullYear(), prev.getMonth() - 1);
            if (next.getTime() < earliestMonthRef.current.getTime()) return prev;
            return next;
          });
        } else if (gestureState.dx < -50 && canGoForwardRef.current) {
          setCurrentMonth((prev) => {
            const next = new Date(prev.getFullYear(), prev.getMonth() + 1);
            if (next.getTime() > currentMonthLimitRef.current.getTime()) return prev;
            return next;
          });
        }
      },
    })
  ).current;

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.outerContainer} {...panResponder.panHandlers}>
      {/* Calendar Card */}
      <View style={styles.card}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <Pressable onPress={handlePrevMonth} disabled={!canGoBack} hitSlop={12}>
            <ChevronLeft size={22} color={canGoBack ? Colors.textPrimary : Colors.border} />
          </Pressable>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <Pressable onPress={handleNextMonth} disabled={!canGoForward} hitSlop={12}>
            <ChevronRight size={22} color={canGoForward ? Colors.textPrimary : Colors.border} />
          </Pressable>
        </View>

        {/* Day Labels */}
        <View style={styles.dayLabelsRow}>
          {dayLabels.map((label, index) => (
            <View key={index} style={styles.dayLabelCell}>
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const dayWorkouts = getWorkoutsForDate(day);
            const hasWorkout = dayWorkouts.length > 0;
            const isToday =
              new Date().toDateString() ===
              new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
            const isSelected =
              selectedDate?.toDateString() ===
              new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

            return (
              <Pressable
                key={day}
                style={[
                  styles.dayCell,
                  hasWorkout && styles.workoutCell,
                  isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() =>
                  onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
                }
              >
                <Text
                  style={[
                    styles.dayNumber,
                    hasWorkout && styles.workoutDayNumber,
                    isSelected && styles.selectedDayNumber,
                  ]}
                >
                  {day}
                </Text>
                {hasWorkout && (
                  <Text style={styles.workoutLabel} numberOfLines={1}>
                    {dayWorkouts[0].name.length > 6
                      ? dayWorkouts[0].name.substring(0, 5) + '…'
                      : dayWorkouts[0].name}
                  </Text>
                )}
                {dayWorkouts.length > 1 && (
                  <Text style={styles.workoutCount}>+{dayWorkouts.length - 1}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: CALENDAR_PADDING,
    paddingTop: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  dayCell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH + 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    borderRadius: 8,
  },
  workoutCell: {
    backgroundColor: Colors.bgElevated,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  selectedCell: {
    backgroundColor: Colors.highlight,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  dayNumber: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  workoutDayNumber: {
    fontWeight: '600',
  },
  selectedDayNumber: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  workoutLabel: {
    fontSize: 8,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: '100%',
    paddingHorizontal: 2,
  },
  workoutCount: {
    fontSize: 8,
    color: Colors.textTertiary,
    marginTop: 1,
  },
});
