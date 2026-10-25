import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useStepsStore } from '../store/useStepsStore';
import { useUserStore } from '../store/useUserStore';
import { Button } from './common/Button';
import {
  calculateDistanceKm,
  calculateCaloriesBurned,
  formatDistance,
} from '../utils/calculations';
import { triggerHaptic } from '../utils/soundHaptics';

export const ManualStepModal: React.FC = () => {
  const { colors, typography, borderRadius, spacing } = useAppTheme();
  const { t, isRTL } = useTranslation();
  const { showManualEntryModal, setShowManualEntryModal, addSteps, todayDate } = useStepsStore();
  const { heightCm, weightKg, gender, units } = useUserStore();

  const [stepInput, setStepInput] = useState('1000');
  const [errorMessage, setErrorMessage] = useState('');

  const numSteps = parseInt(stepInput, 10) || 0;
  const previewDistance = calculateDistanceKm(numSteps, heightCm, gender);
  const previewCalories = calculateCaloriesBurned(numSteps, weightKg);

  const handleQuickAdd = (increment: number) => {
    triggerHaptic('light');
    const current = parseInt(stepInput, 10) || 0;
    setStepInput(String(Math.min(100000, current + increment)));
    setErrorMessage('');
  };

  const handleSave = async () => {
    const steps = parseInt(stepInput, 10);
    if (isNaN(steps) || steps <= 0 || steps > 100000) {
      setErrorMessage(t('invalidStepCount'));
      triggerHaptic('error');
      return;
    }

    await addSteps(steps, todayDate);
    triggerHaptic('success');
    setShowManualEntryModal(false);
    setStepInput('1000');
    setErrorMessage('');
  };

  const handleClose = () => {
    setShowManualEntryModal(false);
    setErrorMessage('');
  };

  return (
    <Modal
      visible={showManualEntryModal}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.xl,
              borderColor: colors.cardBorder,
              padding: spacing.xl,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.titleArea}>
              <Text style={[typography.h3, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('manualEntryTitle')}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('manualEntryDesc')}
              </Text>
            </View>

            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={26} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Step Input */}
          <View style={{ marginVertical: spacing.lg }}>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
              {t('stepsInputLabel')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errorMessage ? colors.error : colors.inputBorder,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Ionicons name="footsteps" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <TextInput
                value={stepInput}
                onChangeText={(text) => {
                  setStepInput(text.replace(/[^0-9]/g, ''));
                  setErrorMessage('');
                }}
                keyboardType="numeric"
                maxLength={6}
                placeholder="1000"
                placeholderTextColor={colors.textMuted}
                style={[typography.h2, { color: colors.text, flex: 1, paddingVertical: 8 }]}
              />
            </View>
            {errorMessage ? (
              <Text style={[typography.caption, { color: colors.error, marginTop: 4 }]}>
                {errorMessage}
              </Text>
            ) : null}
          </View>

          {/* Quick Increment Chips */}
          <View style={styles.chipsRow}>
            {[500, 1000, 2500, 5000].map((chip) => (
              <TouchableOpacity
                key={chip}
                onPress={() => handleQuickAdd(chip)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <Text style={[typography.small, { color: colors.text }]}>+{chip.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview Metrics */}
          <View
            style={[
              styles.previewContainer,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                borderColor: colors.border,
                marginVertical: spacing.lg,
              },
            ]}
          >
            <View style={styles.previewItem}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('distance')}</Text>
              <Text style={[typography.bodyBold, { color: colors.statDistance }]}>
                {formatDistance(previewDistance, units)}
              </Text>
            </View>
            <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
            <View style={styles.previewItem}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('calories')}</Text>
              <Text style={[typography.bodyBold, { color: colors.statCalories }]}>
                {previewCalories} {t('kcalUnit')}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.actionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Button
              title={t('cancel')}
              variant="ghost"
              onPress={handleClose}
              style={{ flex: 1, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
            />
            <Button
              title={t('saveSteps')}
              variant="primary"
              onPress={handleSave}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderWidth: 1,
  },
  previewItem: {
    alignItems: 'center',
  },
  previewDivider: {
    width: 1,
    height: 28,
  },
  actionRow: {
    alignItems: 'center',
  },
});
