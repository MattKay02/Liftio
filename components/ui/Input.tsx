import { TextInput, StyleSheet, TextInputProps, Keyboard } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'number';
}

export const Input = ({ variant = 'default', style, onSubmitEditing, ...props }: InputProps) => {
  const handleSubmitEditing = (e: any) => {
    Keyboard.dismiss();
    onSubmitEditing?.(e);
  };

  return (
    <TextInput
      style={[styles.input, variant === 'number' && styles.numberInput, style]}
      placeholderTextColor={Colors.textTertiary}
      returnKeyType="done"
      blurOnSubmit={true}
      onSubmitEditing={handleSubmitEditing}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.body,
    color: Colors.textPrimary,
    minHeight: 44,
    fontFamily: Typography.fontFamily.primary,
  },
  numberInput: {
    textAlign: 'center',
    fontFamily: Typography.fontFamily.mono,
  },
});
