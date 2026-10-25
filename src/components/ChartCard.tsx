import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../theme/themeContext';
import { formatSteps } from '../utils/calculations';
import { PressableScale } from './animated/PressableScale';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryLabel?: string;
}

export interface ChartCardProps {
  title: string;
  data: ChartDataPoint[];
  goal?: number;
  unit?: string;
  height?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  goal,
  unit = 'steps',
  height = 190,
}) => {
  const { colors, typography, borderRadius, spacing, shadows } = useAppTheme();
  const [chartWidth, setChartWidth] = useState(300);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setChartWidth(width - spacing.lg * 2);
    }
  };

  const chartHeight = height - 44;
  const maxValue = Math.max(...data.map((d) => d.value), goal || 0, 100);

  const barCount = data.length;
  const barSpacing = barCount > 14 ? 3 : 8;
  const totalSpacing = barSpacing * (barCount + 1);
  const barWidth = Math.max(5, Math.min(28, (chartWidth - totalSpacing) / (barCount || 1)));

  const goalY = goal && maxValue > 0 ? chartHeight - (goal / maxValue) * chartHeight : null;
  const selectedPoint = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.xl,
          borderColor: colors.cardBorder,
          padding: spacing.lg,
          ...shadows.card,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
          {selectedPoint ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Text style={[typography.caption, { color: colors.primary, marginTop: 2, fontWeight: '700' }]}>
                {selectedPoint.secondaryLabel || selectedPoint.label}: {formatSteps(selectedPoint.value)} {unit}
              </Text>
            </Animated.View>
          ) : (
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Tap any bar for details
            </Text>
          )}
        </View>

        {goal && (
          <View
            style={[
              styles.goalLegend,
              {
                backgroundColor: colors.accentLight,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <View style={[styles.goalDot, { backgroundColor: colors.accent }]} />
            <Text style={[typography.small, { color: colors.textSecondary, fontWeight: '600' }]}>
              Goal: {formatSteps(goal)}
            </Text>
          </View>
        )}
      </View>

      <View style={{ height, marginTop: spacing.md }}>
        <Svg width={chartWidth} height={height}>
          <Defs>
            <LinearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.primary} />
              <Stop offset="100%" stopColor={colors.primaryDark} />
            </LinearGradient>
            <LinearGradient id="barGradSelected" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.secondary} />
              <Stop offset="100%" stopColor={colors.primary} />
            </LinearGradient>
          </Defs>

          {/* Goal reference dashed line */}
          {goalY !== null && (
            <Line
              x1={0}
              y1={goalY}
              x2={chartWidth}
              y2={goalY}
              stroke={colors.accent}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.8}
            />
          )}

          {/* Baseline */}
          <Line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke={colors.divider}
            strokeWidth={1}
          />

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
            const x =
              (chartWidth - (barCount * barWidth + (barCount - 1) * barSpacing)) / 2 +
              index * (barWidth + barSpacing);
            const y = chartHeight - barHeight;
            const isSelected = selectedIndex === index;

            return (
              <React.Fragment key={`bar-${index}`}>
                <Rect
                  x={x}
                  y={Math.max(0, y)}
                  width={barWidth}
                  height={Math.max(4, barHeight)}
                  rx={barWidth / 2}
                  ry={barWidth / 2}
                  fill={isSelected ? 'url(#barGradSelected)' : 'url(#barGrad)'}
                  opacity={item.value === 0 ? 0.2 : isSelected ? 1 : 0.85}
                  onPress={() => setSelectedIndex(index)}
                />

                {/* X-axis labels */}
                {(barCount <= 7 || index % Math.ceil(barCount / 6) === 0) && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight + 16}
                    fontSize={10}
                    fill={isSelected ? colors.primary : colors.textMuted}
                    textAnchor="middle"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {item.label}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
