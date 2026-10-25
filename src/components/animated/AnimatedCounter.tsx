import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  formatter?: (val: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 800,
  style,
  formatter = (v) => Math.round(v).toLocaleString(),
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) return;

    let animId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic calculation
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + diff * eased));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return <Text style={style}>{formatter(displayValue)}</Text>;
};
