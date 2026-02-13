import React, { useRef, useEffect, useState } from 'react';
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
  Alert,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, Shadows } from '@/constants';
import { PREMADE_WORKOUTS, PremadeWorkout } from '@/constants/PremadeWorkouts';
import { saveTemplate } from '@/lib/database/queries/workouts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 120;

interface PremadeWorkoutsSlideUpProps {
  visible: boolean;
  onClose: () => void;
  onWorkoutAdded: () => void;
}

export const PremadeWorkoutsSlideUp = ({ visible, onClose, onWorkoutAdded }: PremadeWorkoutsSlideUpProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scrollOffset = useRef(0);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      setAddedIds(new Set());
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

  const handleAdd = (workout: PremadeWorkout) => {
    try {
      saveTemplate(workout.name, workout.exercises, workout.id);
      setAddedIds((prev) => new Set(prev).add(workout.id));
      onWorkoutAdded();
    } catch (e) {
      Alert.alert('Error', 'Failed to add workout. Please try again.');
    }
  };

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
            <Text style={styles.title}>Premade Workouts</Text>
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
            {PREMADE_WORKOUTS.map((workout) => {
              const isAdded = addedIds.has(workout.id);
              return (
                <View key={workout.id} style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardName}>{workout.name}</Text>
                    <Text style={styles.cardDescription}>{workout.description}</Text>
                    <Text style={styles.cardMeta}>
                      {workout.exercises.length} exercises
                    </Text>
                    <Text style={styles.cardExercises} numberOfLines={2}>
                      {workout.exercises.join('  \u00B7  ')}
                    </Text>
                  </View>
                  {isAdded ? (
                    <View style={styles.addedButton}>
                      <Check size={16} color={Colors.green600} />
                      <Text style={styles.addedText}>Added</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.addButtonPressed,
                      ]}
                      onPress={() => handleAdd(workout)}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
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
    ...Shadows.elevated,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardName: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  cardMeta: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  cardExercises: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  addButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.accentText,
  },
  addedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  addedText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.semibold,
  },
});
