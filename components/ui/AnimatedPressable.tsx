import React, { useCallback } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  scaleValue?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedPressable = ({
  scaleValue = 0.97,
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(scaleValue, {
        damping: 15,
        stiffness: 400,
        mass: 0.3,
      });
      onPressIn?.(e);
    },
    [scaleValue, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      onPressOut?.(e);
    },
    [onPressOut]
  );

  return (
    <AnimatedPressableView
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedPressableView>
  );
};
