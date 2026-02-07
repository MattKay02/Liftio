import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
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
    <Pressable
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, labelStyle, textStyle]}>{title}</Text>
    </Pressable>
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
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: Colors.grey200,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.grey800,
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
    color: Colors.white,
  },
  secondary: {
    color: Colors.grey600,
  },
  destructive: {
    color: Colors.red600,
  },
  text: {
    color: Colors.grey600,
    fontWeight: Typography.fontWeight.regular,
  },
});
