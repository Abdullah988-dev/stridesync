import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useUserStore } from '../store/useUserStore';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PressableScale } from '../components/animated/PressableScale';
import { StaggerItem } from '../components/animated/StaggerItem';
import { calculateStrideLengthCm, Gender } from '../utils/calculations';
import { triggerHaptic } from '../utils/soundHaptics';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete }) => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();
  const { completeOnboarding } = useUserStore();

  const [name, setName] = useState('Alex');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('70');
  const [dailyGoal, setDailyGoal] = useState('10000');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const numHeight = parseInt(heightCm, 10) || 175;
  const numWeight = parseInt(weightKg, 10) || 70;
  const numGoal = parseInt(dailyGoal, 10) || 10000;
  const numAge = parseInt(age, 10) || 28;

  const strideCm = calculateStrideLengthCm(numHeight, gender);

  const handleSubmit = async () => {
    triggerHaptic('medium');
    await completeOnboarding({
      name: name.trim() || 'Runner',
      age: numAge,
      gender,
      heightCm: numHeight,
      weightKg: numWeight,
      dailyGoal: numGoal,
    });
    onComplete();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <StaggerItem index={0}>
            <View style={styles.headerArea}>
              <LinearGradient
                colors={colors.primaryGradient || [colors.primary, '#00D2FF']}
                style={[
                  styles.badgeCircle,
                  {
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </LinearGradient>

              <Text style={[typography.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
                {t('profileSetupTitle')}
              </Text>

              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
                ]}
              >
                {t('profileSetupSubtitle')}
              </Text>
            </View>
          </StaggerItem>

          {/* Form Fields */}
          <View style={{ marginTop: spacing.xl }}>
            {/* Name */}
            <StaggerItem index={1}>
              <View style={styles.fieldGroup}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                  {t('nameLabel')}
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setActiveInput('name')}
                  onBlur={() => setActiveInput(null)}
                  placeholder={t('namePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: activeInput === 'name' ? colors.primary : colors.inputBorder,
                      borderRadius: borderRadius.md,
                      color: colors.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                />
              </View>
            </StaggerItem>

            {/* Gender Selector */}
            <StaggerItem index={2}>
              <View style={styles.fieldGroup}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                  {t('genderLabel')}
                </Text>
                <View style={[styles.genderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {(['male', 'female', 'other'] as Gender[]).map((g) => {
                    const isSelected = gender === g;
                    const label =
                      g === 'male'
                        ? t('genderMale')
                        : g === 'female'
                        ? t('genderFemale')
                        : t('genderOther');

                    return (
                      <PressableScale
                        key={g}
                        onPress={() => {
                          triggerHaptic('light');
                          setGender(g);
                        }}
                        style={[
                          styles.genderOption,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceGlass,
                            borderColor: isSelected ? colors.primary : colors.cardGlassBorder,
                            borderRadius: borderRadius.md,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.bodyBold,
                            { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>
            </StaggerItem>

            {/* Age & Height */}
            <StaggerItem index={3}>
              <View style={[styles.twoColumnRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={{ flex: 1, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                    {t('ageLabel')}
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    onFocus={() => setActiveInput('age')}
                    onBlur={() => setActiveInput(null)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: activeInput === 'age' ? colors.primary : colors.inputBorder,
                        borderRadius: borderRadius.md,
                        color: colors.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                    {t('heightLabel')} (cm)
                  </Text>
                  <TextInput
                    value={heightCm}
                    onChangeText={setHeightCm}
                    onFocus={() => setActiveInput('height')}
                    onBlur={() => setActiveInput(null)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: activeInput === 'height' ? colors.primary : colors.inputBorder,
                        borderRadius: borderRadius.md,
                        color: colors.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  />
                </View>
              </View>
            </StaggerItem>

            {/* Weight & Daily Goal */}
            <StaggerItem index={4}>
              <View style={[styles.twoColumnRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={{ flex: 1, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                    {t('weightLabel')} (kg)
                  </Text>
                  <TextInput
                    value={weightKg}
                    onChangeText={setWeightKg}
                    onFocus={() => setActiveInput('weight')}
                    onBlur={() => setActiveInput(null)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: activeInput === 'weight' ? colors.primary : colors.inputBorder,
                        borderRadius: borderRadius.md,
                        color: colors.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                    {t('dailyGoal')}
                  </Text>
                  <TextInput
                    value={dailyGoal}
                    onChangeText={setDailyGoal}
                    onFocus={() => setActiveInput('goal')}
                    onBlur={() => setActiveInput(null)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: activeInput === 'goal' ? colors.primary : colors.inputBorder,
                        borderRadius: borderRadius.md,
                        color: colors.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  />
                </View>
              </View>
            </StaggerItem>

            {/* Calculated Stride Preview Card */}
            <StaggerItem index={5}>
              <Card
                style={[
                  styles.strideCard,
                  {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.cardGlassBorder,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <View style={[styles.strideRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View
                    style={[
                      styles.strideIconPill,
                      {
                        backgroundColor: colors.primaryLight,
                        borderRadius: borderRadius.full,
                      },
                    ]}
                  >
                    <Ionicons name="speedometer-outline" size={20} color={colors.primaryDark} />
                  </View>

                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Estimated Stride Length
                    </Text>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>
                      {strideCm.toFixed(1)} cm / step
                    </Text>
                  </View>

                  <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
                </View>
              </Card>
            </StaggerItem>

            {/* Submit Button */}
            <StaggerItem index={6}>
              <Button
                title={t('continueBtn')}
                variant="gradient"
                size="lg"
                onPress={handleSubmit}
                style={{ width: '100%', marginTop: spacing.xxl }}
              />
            </StaggerItem>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerArea: {
    alignItems: 'center',
    marginTop: 12,
  },
  badgeCircle: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  strideCard: {
    borderWidth: 1,
  },
  strideRow: {
    alignItems: 'center',
  },
  strideIconPill: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
