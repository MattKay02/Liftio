import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Colors, Spacing, Typography } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'text';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) => {
  const buttonStyle = variantStyles[variant] ?? variantStyles.primary;
  const labelStyle = textVariantStyles[variant] ?? textVariantStyles.primary;

  return (
    <AnimatedPressable
      scaleValue={variant === 'text' ? 0.97 : 0.96}
      style={[styles.button, buttonStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, labelStyle, textStyle]}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
  },
  disabled: {
    backgroundColor: Colors.bgElevated,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: 'transparent',
  },
  text: {
    backgroundColor: 'transparent',
    minHeight: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});

const textVariantStyles = StyleSheet.create({
  primary: {
    color: Colors.accentText,
  },
  secondary: {
    color: Colors.textSecondary,
  },
  destructive: {
    color: Colors.red600,
  },
  text: {
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.regular,
  },
});
