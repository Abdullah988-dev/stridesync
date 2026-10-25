import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../theme/themeContext';
import { PressableScale } from '../animated/PressableScale';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gradient' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { colors, borderRadius, spacing, typography } = useAppTheme();

  const getContainerStyle = (): ViewStyle => {
    let bg = colors.primary;
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (variant === 'secondary') {
      bg = colors.secondary;
    } else if (variant === 'outline') {
      bg = 'transparent';
      borderColor = colors.primary;
      borderWidth = 1.5;
    } else if (variant === 'ghost') {
      bg = 'transparent';
    } else if (variant === 'danger') {
      bg = colors.error;
    } else if (variant === 'gradient') {
      bg = 'transparent';
    }

    let paddingVertical = spacing.md;
    let paddingHorizontal = spacing.xl;

    if (size === 'sm') {
      paddingVertical = spacing.sm;
      paddingHorizontal = spacing.md;
    } else if (size === 'lg') {
      paddingVertical = spacing.lg;
      paddingHorizontal = spacing.xxl;
    }

    return {
      backgroundColor: bg,
      borderColor,
      borderWidth,
      borderRadius: borderRadius.lg,
      paddingVertical: variant === 'gradient' ? 0 : paddingVertical,
      paddingHorizontal: variant === 'gradient' ? 0 : paddingHorizontal,
      opacity: disabled ? 0.5 : 1,
      overflow: 'hidden',
    };
  };

  const getTextStyle = (): TextStyle => {
    let color = '#FFFFFF';
    if (variant === 'outline') {
      color = colors.primary;
    } else if (variant === 'ghost') {
      color = colors.text;
    }

    let fontSize = typography.bodyBold.fontSize;
    if (size === 'sm') fontSize = typography.caption.fontSize;
    if (size === 'lg') fontSize = typography.bodyLarge.fontSize;

    return {
      color,
      fontSize,
      fontWeight: '700',
    };
  };

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.96}
      style={[styles.button, getContainerStyle(), style]}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md,
            paddingHorizontal: size === 'sm' ? spacing.md : size === 'lg' ? spacing.xxl : spacing.xl,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    textAlign: 'center',
  },
});
