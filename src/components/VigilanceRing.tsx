/**
 * Vigilance Ring — circular gauge that shows vigilance level
 * Uses react-native-svg for the arc
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontSize } from '../constants/theme';
import { VigilanceLevel } from '../types';

interface VigilanceRingProps {
  score: number;       // 0–100
  level: VigilanceLevel;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const LEVEL_COLORS: Record<VigilanceLevel, string> = {
  high: Colors.success,
  medium: Colors.warning,
  low: Colors.danger,
};

const LEVEL_LABELS: Record<VigilanceLevel, string> = {
  high: 'OK',
  medium: 'Moyen',
  low: 'Basse',
};

export function VigilanceRing({
  score,
  level,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}: VigilanceRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = LEVEL_COLORS[level];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.bgCardLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.score, { color }]}>{Math.round(score)}</Text>
          <Text style={[styles.label, { color }]}>{LEVEL_LABELS[level]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  score: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
});
