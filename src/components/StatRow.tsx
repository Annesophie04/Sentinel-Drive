/**
 * StatRow — horizontal row of stat items
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color?: string;
}

interface StatRowProps {
  stats: StatItem[];
}

export function StatRow({ stats }: StatRowProps) {
  return (
    <View style={styles.row}>
      {stats.map((stat, i) => (
        <View key={i} style={styles.item}>
          <Ionicons
            name={stat.icon}
            size={20}
            color={stat.color || Colors.primary}
          />
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    gap: 4,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  label: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
