import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { X, Pencil } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants';
import { WorkoutWithExercises } from '@/types/workout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTimeSinceString, formatDuration, formatTimeOfDay, getTotalWeight, formatWeight } from '@/lib/utils/date';
import { useSettingsStore } from '@/lib/stores/settingsStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 120;

interface AllWorkoutsSlideUpProps {
  visible: boolean;
  workouts: WorkoutWithExercises[];
  onClose: () => void;
  onViewWorkout: (workout: WorkoutWithExercises) => void;
  onEditWorkout: (workout: WorkoutWithExercises) => void;
}

export const AllWorkoutsSlideUp = ({ visible, workouts, onClose, onViewWorkout, onEditWorkout }: AllWorkoutsSlideUpProps) => {
  const insets = useSafeAreaInsets();
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scrollOffset = useRef(0);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 200,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  const dismissPanel = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && scrollOffset.current <= 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          dismissPanel();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 25,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={dismissPanel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.dimmedBackground} onPress={dismissPanel} />

        <Animated.View
          style={[
            styles.panel,
            { paddingBottom: insets.bottom, transform: [{ translateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>All Workouts</Text>
            <Pressable onPress={dismissPanel} style={styles.closeButton} hitSlop={8}>
              <X size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              scrollOffset.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          >
            {workouts.map((workout) => (
              <Pressable
                key={workout.id}
                style={({ pressed }) => [
                  styles.workoutCard,
                  pressed && styles.workoutCardPressed,
                ]}
                onPress={() => {
                  dismissPanel();
                  setTimeout(() => onViewWorkout(workout), 300);
                }}
              >
                <View style={styles.workoutCardContent}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                    {workout.duration ? ` \u00B7 ${formatDuration(workout.duration)}` : ''}
                    {getTotalWeight(workout.exercises) > 0 ? ` \u00B7 ${formatWeight(getTotalWeight(workout.exercises), weightUnit)}` : ''}
                  </Text>
                  <Text style={styles.workoutDate}>
                    {getTimeSinceString(workout.date)} {'\u00B7'} {formatTimeOfDay(workout.date)}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.editButtonPressed,
                  ]}
                  onPress={() => {
                    dismissPanel();
                    setTimeout(() => onEditWorkout(workout), 300);
                  }}
                  hitSlop={8}
                >
                  <Pencil size={16} color={Colors.textSecondary} />
                </Pressable>
              </Pressable>
            ))}
            <View style={{ height: Spacing.xl }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dimmedBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textTertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  workoutCardPressed: {
    opacity: 0.7,
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  workoutMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  workoutDate: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.bgElevated,
  },
  editButtonPressed: {
    opacity: 0.6,
  },
});
