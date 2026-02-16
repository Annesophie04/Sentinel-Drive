/**
 * AlertToast — non-intrusive notification overlay during driving
 * Slides in from top, auto-dismisses
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, FontSize, Shadow } from '../constants/theme';
import { TripEvent } from '../types';

interface AlertToastProps {
  event: TripEvent | null;
}

const EVENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  harsh_brake: 'warning-outline',
  harsh_accel: 'speedometer-outline',
  overspeed: 'flash-outline',
  vigilance_low: 'eye-off-outline',
  pause_recommended: 'cafe-outline',
};

const EVENT_COLORS: Record<string, string> = {
  harsh_brake: Colors.danger,
  harsh_accel: Colors.warning,
  overspeed: Colors.danger,
  vigilance_low: Colors.warning,
  pause_recommended: Colors.primary,
};

export function AlertToast({ event }: AlertToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (event) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }
  }, [event]);

  if (!event) return null;

  const iconName = EVENT_ICONS[event.type] || 'alert-circle-outline';
  const color = EVENT_COLORS[event.type] || Colors.warning;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity, borderLeftColor: color },
      ]}
    >
      <Ionicons name={iconName} size={22} color={color} />
      <Text style={styles.message} numberOfLines={2}>
        {event.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    zIndex: 999,
    ...Shadow.card,
  },
  message: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
  },
});
