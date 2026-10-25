import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/themeContext';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { GLASS_THEMES, GlassThemeId, GlassThemeConfig } from '../theme/glassTheme';
import { triggerHaptic } from '../utils/soundHaptics';

interface ThemePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToAuth?: () => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  visible,
  onClose,
  onNavigateToAuth,
}) => {
  const { colors, typography, borderRadius, spacing } = useAppTheme();
  const { isAuthenticated, isGuest } = useAuthStore();
  const { glassTheme, setGlassTheme } = useUserStore();

  const isMember = isAuthenticated && !isGuest;
  const themeList: GlassThemeConfig[] = Object.values(GLASS_THEMES);

  const handleSelectTheme = async (id: GlassThemeId) => {
    if (!isMember) {
      triggerHaptic('warning');
      onClose();
      onNavigateToAuth?.();
      return;
    }

    triggerHaptic('success');
    await setGlassTheme(id);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isMember ? 'rgba(15, 23, 42, 0.95)' : colors.card,
              borderColor: isMember ? 'rgba(255, 255, 255, 0.18)' : colors.cardBorder,
              borderRadius: borderRadius.xxl,
              padding: spacing.xl,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Ionicons
                  name={isMember ? 'sparkles' : 'lock-closed'}
                  size={14}
                  color={isMember ? '#38BDF8' : '#EAB308'}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: isMember ? '#38BDF8' : '#EAB308', marginLeft: 4 },
                  ]}
                >
                  {isMember ? 'LIQUID GLASS THEMES' : 'MEMBER EXCLUSIVE'}
                </Text>
              </View>
              <Text style={[typography.h3, { color: colors.text, marginTop: 4 }]}>
                Choose Color Aura
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {isMember
                  ? 'Select your ambient gradient & frosted glass theme'
                  : 'Register a free account to unlock all 6 Liquid Glass themes'}
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Theme List Grid */}
          <ScrollView style={{ maxHeight: 360, marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
            {themeList.map((item) => {
              const isSelected = isMember && glassTheme === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectTheme(item.id)}
                  style={[
                    styles.themeItem,
                    {
                      borderColor: isSelected ? item.primary : 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: borderRadius.lg,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  {/* Gradient Preview Pill */}
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradientSwatch, { borderRadius: borderRadius.md }]}
                  />

                  {/* Theme Info */}
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[typography.small, { color: colors.textMuted }]}>
                      {item.subtitle}
                    </Text>
                  </View>

                  {/* Status Indicator */}
                  {isSelected ? (
                    <View
                      style={[
                        styles.checkCircle,
                        { backgroundColor: item.primary, borderRadius: borderRadius.full },
                      ]}
                    >
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  ) : !isMember ? (
                    <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
                  ) : (
                    <View
                      style={[
                        styles.emptyCircle,
                        { borderColor: colors.border, borderRadius: borderRadius.full },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Action for Guest */}
          {!isMember && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onNavigateToAuth?.();
              }}
              style={{ marginTop: spacing.lg }}
            >
              <LinearGradient
                colors={['#7C3AED', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.unlockButton, { borderRadius: borderRadius.lg }]}
              >
                <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.unlockButtonText}>Register Free to Unlock Themes</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
  },
  gradientSwatch: {
    width: 44,
    height: 36,
  },
  checkCircle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
