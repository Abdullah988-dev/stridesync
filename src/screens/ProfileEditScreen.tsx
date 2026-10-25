import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useUserStore } from '../store/useUserStore';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { PressableScale } from '../components/animated/PressableScale';
import { StaggerItem } from '../components/animated/StaggerItem';
import { calculateStrideLengthCm, calculateCaloriesBurned, Gender } from '../utils/calculations';
import { triggerHaptic } from '../utils/soundHaptics';

interface ProfileEditScreenProps {
  onBack: () => void;
}

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ onBack }) => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation();

  const user = useUserStore();

  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(String(user.age));
  const [gender, setGender] = useState<Gender>(user.gender);
  const [heightCm, setHeightCm] = useState(String(user.heightCm));
  const [weightKg, setWeightKg] = useState(String(user.weightKg));
  const [dailyGoal, setDailyGoal] = useState(String(user.dailyGoal));
  const [isSaved, setIsSaved] = useState(false);

  // Check if form is dirty
  const hasUnsavedChanges =
    !isSaved &&
    (name !== user.name ||
      age !== String(user.age) ||
      gender !== user.gender ||
      heightCm !== String(user.heightCm) ||
      weightKg !== String(user.weightKg) ||
      dailyGoal !== String(user.dailyGoal));

  // Android and Gesture Back Listener to prompt before discard
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        return;
      }

      // Prevent default exit
      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved biometric changes. Are you sure you want to discard them and leave?',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const numHeight = parseInt(heightCm, 10) || 175;
  const numWeight = parseInt(weightKg, 10) || 70;
  const numGoal = parseInt(dailyGoal, 10) || 10000;
  const numAge = parseInt(age, 10) || 28;

  const strideCm = calculateStrideLengthCm(numHeight, gender);
  const estimatedCalories10k = calculateCaloriesBurned(10000, numWeight);

  const handleSave = async () => {
    triggerHaptic('success');
    setIsSaved(true);
    await user.updateUserProfile({
      name: name.trim() || 'Runner',
      age: numAge,
      gender,
      heightCm: numHeight,
      weightKg: numWeight,
      dailyGoal: numGoal,
    });
    Alert.alert(t('editProfileTitle'), t('profileSavedSuccess'), [
      { text: 'OK', onPress: onBack },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('editProfileTitle')} showBack onBack={onBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Graphic */}
          <StaggerItem index={0}>
            <View style={styles.avatarArea}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: colors.primaryLight,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Ionicons name="person" size={48} color={colors.primaryDark} />
              </View>
              <Text style={[typography.h3, { color: colors.text, marginTop: spacing.sm }]}>
                {name || 'Runner'}
              </Text>
            </View>
          </StaggerItem>

          {/* Form */}
          <View style={{ marginTop: spacing.lg }}>
            <StaggerItem index={1}>
              <View style={styles.fieldGroup}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                  {t('nameLabel')}
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                      color: colors.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                />
              </View>
            </StaggerItem>

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
                        onPress={() => setGender(g)}
                        style={[
                          styles.genderOption,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: borderRadius.md,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.bodyBold,
                            { color: isSelected ? '#FFFFFF' : colors.text },
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

            <StaggerItem index={3}>
              <View style={[styles.threeColRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.fieldGroup, { flex: 1, marginHorizontal: 4 }]}>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                    {t('ageLabel')}
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    maxLength={3}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        color: colors.text,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1, marginHorizontal: 4 }]}>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                    {t('heightLabel')}
                  </Text>
                  <TextInput
                    value={heightCm}
                    onChangeText={setHeightCm}
                    keyboardType="numeric"
                    maxLength={3}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        color: colors.text,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1, marginHorizontal: 4 }]}>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                    {t('weightLabel')}
                  </Text>
                  <TextInput
                    value={weightKg}
                    onChangeText={setWeightKg}
                    keyboardType="numeric"
                    maxLength={3}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                        color: colors.text,
                      },
                    ]}
                  />
                </View>
              </View>
            </StaggerItem>

            <StaggerItem index={4}>
              <View style={styles.fieldGroup}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                  {t('dailyGoalLabel')}
                </Text>
                <TextInput
                  value={dailyGoal}
                  onChangeText={setDailyGoal}
                  keyboardType="numeric"
                  maxLength={6}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                      color: colors.text,
                    },
                  ]}
                />
              </View>
            </StaggerItem>

            {/* Calculation Insights Card */}
            <StaggerItem index={5}>
              <View
                style={[
                  styles.insightsCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="sparkles" size={18} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={[typography.bodyBold, { color: colors.text }]}>
                    Biometric Formulas
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  • Stride length: <Text style={{ color: colors.primary, fontWeight: '700' }}>{strideCm} cm</Text>
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                  • Calorie burn rate: <Text style={{ color: colors.accent, fontWeight: '700' }}>{estimatedCalories10k} kcal</Text> per 10,000 steps
                </Text>
              </View>
            </StaggerItem>
          </View>

          {/* Save Button */}
          <Button
            title={t('saveChanges')}
            variant="gradient"
            size="lg"
            onPress={handleSave}
            style={{ marginTop: spacing.xl }}
          />

          <View style={{ height: 40 }} />
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
    paddingBottom: 24,
  },
  avatarArea: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  genderRow: {
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
  },
  threeColRow: {
    marginHorizontal: -4,
  },
  insightsCard: {
    borderWidth: 1,
    marginTop: 8,
  },
});
