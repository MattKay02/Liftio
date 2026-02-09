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
import { X } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { WorkoutWithExercises } from '@/types/workout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 120;

interface WorkoutDetailSlideUpProps {
  visible: boolean;
  workout: WorkoutWithExercises | null;
  onClose: () => void;
}

export const WorkoutDetailSlideUp = ({ visible, workout, onClose }: WorkoutDetailSlideUpProps) => {
  const insets = useSafeAreaInsets();
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
        // Only capture downward drags when scroll is at top
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

  if (!workout) {
    return null;
  }

  const durationMinutes = workout.duration ? Math.floor(workout.duration / 60) : 0;
  const durationSeconds = workout.duration ? workout.duration % 60 : 0;
  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={dismissPanel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Dimmed background */}
        <Pressable style={styles.dimmedBackground} onPress={dismissPanel} />

        {/* Slide-up panel */}
        <Animated.View
          style={[
            styles.panel,
            { paddingBottom: insets.bottom, transform: [{ translateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.metadata}>
                {durationMinutes}m {durationSeconds}s  •  {formattedDate}
              </Text>
              {workout.notes && <Text style={styles.notes}>{workout.notes}</Text>}
            </View>
            <Pressable onPress={dismissPanel} style={styles.closeButton} hitSlop={8}>
              <X size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Exercise list */}
          {workout.exercises.length > 0 ? (
            <ScrollView
              style={styles.exercisesContainer}
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                scrollOffset.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
            >
              {workout.exercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseWrapper}>
                  <ExerciseCard exercise={exercise} readonly />
                </View>
              ))}
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exercises logged</Text>
            </View>
          )}
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
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
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
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  workoutName: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  metadata: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  notes: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  closeButton: {
    padding: Spacing.sm,
  },
  exercisesContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  exerciseWrapper: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textTertiary,
  },
});
