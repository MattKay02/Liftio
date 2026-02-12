import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { formatDurationWithSeconds } from '@/lib/utils/date';
import { Colors, Typography, Shadows } from '@/constants';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const HIDDEN_ROUTES = ['/workout/active', '/workout/add-exercise', '/workout/finish'];

export function FloatingWorkoutTimer() {
  const isWorkoutActive = useWorkoutStore((s) => s.isWorkoutActive);
  const workoutStartTime = useWorkoutStore((s) => s.workoutStartTime);
  const pathname = usePathname();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (workoutStartTime) {
      setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workoutStartTime]);

  if (!isWorkoutActive || HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <AnimatedPressable
        scaleValue={0.92}
        style={styles.bubble}
        onPress={() => router.push('/workout/active')}
      >
        <Text style={styles.timer}>{formatDurationWithSeconds(elapsed)}</Text>
      </AnimatedPressable>
    </View>
  );
}

const BUBBLE_SIZE = 64;

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingBottom: 100,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: Colors.green600,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevated,
  },
  timer: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
});
