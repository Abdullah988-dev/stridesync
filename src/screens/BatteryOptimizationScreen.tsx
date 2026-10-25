import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StaggerItem } from '../components/animated/StaggerItem';
import { PressableScale } from '../components/animated/PressableScale';

interface BatteryOptimizationScreenProps {
  onBack: () => void;
}

export const BatteryOptimizationScreen: React.FC<BatteryOptimizationScreenProps> = ({ onBack }) => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const guides = [
    {
      brand: 'Realme & Oppo (Realme UI / ColorOS)',
      icon: 'phone-portrait-outline',
      steps: [
        'Settings > Apps > App management > StrideSync',
        'Tap "Battery usage" and enable "Allow background activity"',
        'Enable "Allow auto-launch" so tracking resumes after restart',
        'Lock StrideSync in Recent Apps by tapping the two dots menu and selecting "Lock"',
      ],
    },
    {
      brand: 'Samsung (One UI)',
      icon: 'shield-checkmark-outline',
      steps: [
        'Settings > Apps > StrideSync',
        'Tap "Battery" and choose "Unrestricted"',
        'Settings > Battery > Background usage limits > Never sleeping apps > Add StrideSync',
      ],
    },
    {
      brand: 'Xiaomi / Redmi / Poco (MIUI & HyperOS)',
      icon: 'flash-outline',
      steps: [
        'Settings > Apps > Manage apps > StrideSync',
        'Enable "Autostart"',
        'Battery Saver > Select "No restrictions"',
      ],
    },
    {
      brand: 'Vivo & iQOO (Funtouch OS)',
      icon: 'hardware-chip-outline',
      steps: [
        'Settings > Battery > Background power consumption management',
        'Find StrideSync and set to "High background power usage"',
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Keep Tracking Active" showBack onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Alert */}
        <StaggerItem index={0}>
          <Card
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View style={[styles.heroRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View
                style={[
                  styles.batteryCircle,
                  {
                    backgroundColor: colors.accentLight,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Ionicons name="battery-charging" size={32} color={colors.accent} />
              </View>

              <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                <Text style={[typography.h3, { color: colors.text }]}>
                  Prevent Background Interruption
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
                  ]}
                >
                  Android and phone manufacturers aggressively terminate background step counters.
                  Follow these steps to guarantee 24/7 continuous step counting.
                </Text>
              </View>
            </View>

            <Button
              title="Open System App Settings"
              variant="gradient"
              icon={<Ionicons name="settings-outline" size={18} color="#FFFFFF" />}
              onPress={handleOpenSettings}
              style={{ marginTop: spacing.lg }}
            />
          </Card>
        </StaggerItem>

        <Text
          style={[
            typography.h3,
            { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
          ]}
        >
          Device Guides
        </Text>

        {/* Guides */}
        {guides.map((item, index) => (
          <StaggerItem key={item.brand} index={index + 1}>
            <Card
              style={[
                styles.guideCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={[styles.brandHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                <Text
                  style={[
                    typography.bodyBold,
                    {
                      color: colors.text,
                      marginHorizontal: 8,
                      flex: 1,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {item.brand}
                </Text>
              </View>

              <View style={{ marginTop: spacing.sm }}>
                {item.steps.map((step, sIdx) => (
                  <View
                    key={sIdx}
                    style={[
                      styles.stepRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 6 },
                    ]}
                  >
                    <View
                      style={[
                        styles.stepDot,
                        { backgroundColor: colors.primary, borderRadius: borderRadius.full },
                      ]}
                    />
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: colors.textSecondary,
                          flex: 1,
                          marginHorizontal: 8,
                          textAlign: isRTL ? 'right' : 'left',
                          lineHeight: 18,
                        },
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </StaggerItem>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCard: {
    padding: 18,
    borderWidth: 1.5,
  },
  heroRow: {
    alignItems: 'center',
  },
  batteryCircle: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCard: {
    padding: 16,
    borderWidth: 1,
  },
  brandHeader: {
    alignItems: 'center',
  },
  stepRow: {
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 6,
    height: 6,
    marginTop: 6,
  },
});
