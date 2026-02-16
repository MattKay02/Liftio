import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = SCREEN_WIDTH * 0.5;
const BAR_HEIGHT = 3;

type LoadingScreenProps = {
  isReady: boolean;
  onFinish: () => void;
};

export function LoadingScreen({ isReady, onFinish }: LoadingScreenProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Smoothly animate to 85% over 1.6s, leaving room for the final fill
    progress.value = withTiming(0.85, {
      duration: 1600,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      // When ready, fill to 100% then call onFinish
      progress.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }
  }, [isReady]);

  const barStyle = useAnimatedStyle(() => ({
    width: progress.value * BAR_WIDTH,
  }));

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo/liftio-high-resolution-logo-grayscale-transparent.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 32,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  barFill: {
    height: BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: BAR_HEIGHT / 2,
  },
});
