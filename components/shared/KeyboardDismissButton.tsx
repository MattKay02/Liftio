import { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  KeyboardEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown, Keyboard as KeyboardIcon } from 'lucide-react-native';
import { Colors, Spacing } from '@/constants';

export const KeyboardDismissButton = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
      opacity.value = withTiming(1, { duration: 150 });
    };

    const onHide = () => {
      opacity.value = withTiming(0, { duration: 100 });
      setTimeout(() => setKeyboardHeight(0), 100);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (keyboardHeight === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: keyboardHeight + Spacing.sm },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => Keyboard.dismiss()}
        style={styles.button}
        hitSlop={8}
      >
        <KeyboardIcon size={18} color={Colors.textSecondary} strokeWidth={1.8} />
        <ChevronDown size={14} color={Colors.textSecondary} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 9999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.bgElevated,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
