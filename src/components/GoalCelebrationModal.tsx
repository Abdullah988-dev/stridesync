import React from 'react';
import { Modal, View, Text, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useStepsStore } from '../store/useStepsStore';
import { useUserStore } from '../store/useUserStore';
import { Button } from './common/Button';
import { ConfettiOverlay } from './ConfettiOverlay';
import { formatSteps } from '../utils/calculations';
import { triggerHaptic } from '../utils/soundHaptics';

export const GoalCelebrationModal: React.FC = () => {
  const { colors, typography, borderRadius, spacing } = useAppTheme();
  const { t } = useTranslation();
  const { showGoalCelebration, setShowGoalCelebration, todaySteps } = useStepsStore();
  const { dailyGoal } = useUserStore();

  const handleShare = async () => {
    triggerHaptic('medium');
    try {
      await Share.share({
        message: `I just crushed my daily goal of ${formatSteps(
          dailyGoal
        )} steps on StrideSync! 🏃🔥 Total: ${formatSteps(todaySteps)} steps!`,
      });
    } catch {
      // share cancelled or unavailable
    }
  };

  const handleClose = () => {
    triggerHaptic('light');
    setShowGoalCelebration(false);
  };

  return (
    <Modal
      visible={showGoalCelebration}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <ConfettiOverlay />

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.xl,
              borderColor: colors.primary,
              padding: spacing.xl,
            },
          ]}
        >
          {/* Trophy Badge */}
          <View
            style={[
              styles.trophyWrapper,
              {
                backgroundColor: colors.primaryLight,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Ionicons name="trophy" size={54} color={colors.primaryDark} />
          </View>

          <Text style={[typography.h2, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
            {t('congratsGoalTitle')}
          </Text>

          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
            ]}
          >
            {t('congratsGoalDesc', { goal: formatSteps(dailyGoal) })}
          </Text>

          <View
            style={[
              styles.statsBanner,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                borderColor: colors.cardBorder,
                marginVertical: spacing.lg,
              },
            ]}
          >
            <Text style={[typography.hero, { color: colors.primary, textAlign: 'center' }]}>
              {formatSteps(todaySteps)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
              {t('stepsCount')}
            </Text>
          </View>

          <View style={styles.buttonStack}>
            <Button
              title={t('shareAchievement')}
              variant="primary"
              size="lg"
              icon={<Ionicons name="share-social" size={20} color="#FFFFFF" />}
              onPress={handleShare}
              style={{ marginBottom: 10 }}
            />
            <Button
              title={t('close')}
              variant="ghost"
              onPress={handleClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 10000,
  },
  trophyWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBanner: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
  },
  buttonStack: {
    width: '100%',
  },
});
