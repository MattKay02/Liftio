import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { getExerciseImage, ExerciseImageVariant } from '@/lib/exerciseImages';
import { Colors } from '@/constants/Colors';

interface ExerciseImageProps {
  imageKey: string | null | undefined;
  variant?: ExerciseImageVariant;
  size?: number;
  width?: number;
  height?: number;
  style?: object;
  showPlaceholder?: boolean;
}

export const ExerciseImage = ({
  imageKey,
  variant = 'start',
  size,
  width,
  height,
  style,
  showPlaceholder = true,
}: ExerciseImageProps) => {
  const source = getExerciseImage(imageKey, variant);
  const w = size ?? width ?? 48;
  const h = size ?? height ?? 48;

  if (!source) {
    if (!showPlaceholder) return null;
    return <View style={[styles.placeholder, { width: w, height: h }, style]} />;
  }

  return (
    <Image
      source={source}
      style={[{ width: w, height: h }, style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 8,
  },
});
