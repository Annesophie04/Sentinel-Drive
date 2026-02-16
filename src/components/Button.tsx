/**
 * Reusable Button component
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, Shadow } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
}: ButtonProps) {
  const bgColor = {
    primary: Colors.primary,
    secondary: Colors.bgCardLight,
    danger: Colors.danger,
    ghost: Colors.transparent,
  }[variant];

  const textColor = variant === 'ghost' ? Colors.primary : Colors.white;

  const paddingV = { sm: Spacing.sm, md: Spacing.md, lg: Spacing.lg }[size];
  const fontSize = { sm: FontSize.sm, md: FontSize.md, lg: FontSize.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          paddingVertical: paddingV,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' && Shadow.glow,
        variant === 'ghost' && styles.ghost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  ghost: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
