import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
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
import { Colors, Spacing, Typography, Shadows } from '@/constants';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { formatWeight, formatDuration } from '@/lib/utils/date';
import { StatsLineChart } from './StatsLineChart';
import {
  getExerciseHighestLift,
  getExerciseHighestVolumeSet,
  getWeightOverTime,
  getExerciseVolumeOverTime,
  getExerciseRepsOverTime,
  getExerciseSetsOverTime,
  ExerciseHighestLift,
  ExerciseHighestVolume,
  OverviewDataPoint,
} from '@/lib/database/queries/exerciseStats';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 120;

type ExerciseMetric = 'weight' | 'volume' | 'reps' | 'sets';
type TimeFilter = '30d' | '90d' | 'all';

const METRICS: { key: ExerciseMetric; label: string }[] = [
  { key: 'weight', label: 'Weight' },
  { key: 'volume', label: 'Volume' },
  { key: 'reps', label: 'Reps' },
  { key: 'sets', label: 'Sets' },
];

const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'all', label: 'ALL' },
];

interface ExerciseDetailSlideUpProps {
  visible: boolean;
  exerciseName: string | null;
  onClose: () => void;
}

export const ExerciseDetailSlideUp = ({ visible, exerciseName, onClose }: ExerciseDetailSlideUpProps) => {
  const insets = useSafeAreaInsets();
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scrollOffset = useRef(0);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [metric, setMetric] = useState<ExerciseMetric>('weight');
  const [highestLift, setHighestLift] = useState<ExerciseHighestLift | null>(null);
  const [highestVolume, setHighestVolume] = useState<ExerciseHighestVolume | null>(null);
  const [chartData, setChartData] = useState<OverviewDataPoint[]>([]);

  const sinceTimestamp = useMemo(() => {
    if (timeFilter === 'all') return undefined;
    const days = timeFilter === '30d' ? 30 : 90;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }, [timeFilter]);

  useEffect(() => {
    if (visible && exerciseName) {
      setTimeFilter('all');
      setMetric('weight');
      setHighestLift(getExerciseHighestLift(exerciseName));
      setHighestVolume(getExerciseHighestVolumeSet(exerciseName));
      loadChartData(exerciseName, 'weight', undefined);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 200,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible, exerciseName]);

  useEffect(() => {
    if (visible && exerciseName) {
      setHighestLift(getExerciseHighestLift(exerciseName, sinceTimestamp));
      setHighestVolume(getExerciseHighestVolumeSet(exerciseName, sinceTimestamp));
      loadChartData(exerciseName, metric, sinceTimestamp);
    }
  }, [metric, sinceTimestamp]);

  const loadChartData = (name: string, m: ExerciseMetric, since?: number) => {
    switch (m) {
      case 'weight': {
        const data = getWeightOverTime(name, since);
        setChartData(data.map((d) => ({ date: d.date, value: d.weight })));
        break;
      }
      case 'volume':
        setChartData(getExerciseVolumeOverTime(name, since));
        break;
      case 'reps':
        setChartData(getExerciseRepsOverTime(name, since));
        break;
      case 'sets':
        setChartData(getExerciseSetsOverTime(name, since));
        break;
    }
  };

  const dismissPanel = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [onClose]);

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
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onClose());
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

  const getChartConfig = () => {
    switch (metric) {
      case 'weight':
        return {
          yAxisSuffix: ` ${weightUnit}`,
          tooltipFormatter: (v: number) => `${v} ${weightUnit}`,
        };
      case 'volume':
        return {
          yAxisSuffix: ` ${weightUnit}`,
          tooltipFormatter: (v: number) => `${Math.round(v).toLocaleString()} ${weightUnit}`,
        };
      case 'reps':
        return { yAxisSuffix: '', tooltipFormatter: (v: number) => `${v} reps` };
      case 'sets':
        return { yAxisSuffix: '', tooltipFormatter: (v: number) => `${v} sets` };
    }
  };

  if (!exerciseName) return null;

  const config = getChartConfig();

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={dismissPanel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.dimmedBackground} onPress={dismissPanel} />

        <Animated.View
          style={[styles.panel, { paddingBottom: insets.bottom, transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
            <Pressable onPress={dismissPanel} style={styles.closeButton} hitSlop={8}>
              <X size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
            scrollEventThrottle={16}
          >
            {/* Highlight boxes */}
            <View style={styles.highlightRow}>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightLabel}>Highest Lift</Text>
                <Text style={styles.highlightValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {highestLift ? formatWeight(highestLift.weight, weightUnit) : '---'}
                </Text>
                <Text style={styles.highlightDetail}>
                  {highestLift ? `${highestLift.reps} rep${highestLift.reps !== 1 ? 's' : ''}` : '---'}
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightLabel}>Highest Volume Set</Text>
                <Text style={styles.highlightValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {highestVolume ? formatWeight(highestVolume.volume, weightUnit) : '---'}
                </Text>
                <Text style={styles.highlightDetail}>
                  {highestVolume ? `${highestVolume.reps}x${highestVolume.weight}` : '---'}
                </Text>
              </View>
            </View>

            {/* Metric pills */}
            <View style={styles.pillRow}>
              {METRICS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  style={[styles.pill, metric === key && styles.pillActive]}
                  onPress={() => setMetric(key)}
                >
                  <Text style={[styles.pillText, metric === key && styles.pillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Time filter pills */}
            <View style={styles.pillRow}>
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

            <StatsLineChart
              dataPoints={chartData}
              yAxisSuffix={config.yAxisSuffix}
              tooltipFormatter={config.tooltipFormatter}
            />

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
    flex: 1,
    marginRight: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
  },
  highlightLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  highlightValue: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  highlightDetail: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
  },
  pillActive: {
    backgroundColor: Colors.accent,
  },
  pillText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.accentText,
    fontWeight: Typography.fontWeight.semibold,
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
