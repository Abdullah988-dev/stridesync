import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAppTheme } from '../theme/themeContext';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { waterNotificationService } from '../services/waterNotificationService';
import { triggerHaptic } from '../utils/soundHaptics';

interface AuthScreenProps {
  onSuccess?: () => void;
  onContinueGuest?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onContinueGuest,
  initialMode = 'register',
}) => {
  const { colors, typography, borderRadius, spacing } = useAppTheme();
  const { register, login, continueAsGuest } = useAuthStore();
  const { updateUserProfile } = useUserStore();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    setLoading(true);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.');
        setLoading(false);
        return;
      }

      const res = await register(name, email, password);
      setLoading(false);

      if (res.success) {
        // Update user store name
        await updateUserProfile({ name: name.trim() });
        // Schedule periodic hydration reminders for registered user
        await waterNotificationService.scheduleHydrationReminders();
        Alert.alert('🎉 Welcome to StrideSync!', 'Your account has been created. Water tracker and smart notifications are now fully unlocked!');
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);

      if (res.success) {
        const authUser = useAuthStore.getState().user;
        if (authUser?.name) {
          await updateUserProfile({ name: authUser.name });
        }
        await waterNotificationService.scheduleHydrationReminders();
        Alert.alert('👋 Welcome Back!', 'Signed in successfully. All features are active!');
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    }
  };

  const handleGuest = async () => {
    await continueAsGuest();
    if (onContinueGuest) {
      onContinueGuest();
    } else if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand Glow */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <LinearGradient
              colors={['#10B981', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.logoBox, { borderRadius: 22 }]}
            >
              <Ionicons name="footsteps" size={34} color="#FFFFFF" />
            </LinearGradient>

            <Text style={[typography.h1, styles.brandTitle, { color: colors.text }]}>
              StrideSync
            </Text>
            <Text style={[typography.body, styles.brandSubtitle, { color: colors.textSecondary }]}>
              {mode === 'register'
                ? 'Create an account to unlock Water Tracker & Smart Alerts'
                : 'Sign in to access your hydration goals & synced data'}
            </Text>
          </Animated.View>

          {/* Mode Switcher Tabs */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.tabContainer}>
            <View style={[styles.tabTrack, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('light');
                  setMode('register');
                  setErrorMsg('');
                }}
                style={[
                  styles.tabButton,
                  mode === 'register' && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: mode === 'register' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('light');
                  setMode('login');
                  setErrorMsg('');
                }}
                style={[
                  styles.tabButton,
                  mode === 'login' && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: mode === 'login' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Perks Highlight Bar */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.perksRow}>
            <View style={[styles.perkChip, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <Ionicons name="water" size={14} color="#38BDF8" style={{ marginRight: 5 }} />
              <Text style={[typography.small, { color: '#38BDF8', fontWeight: '700' }]}>
                Water Tracker
              </Text>
            </View>
            <View style={[styles.perkChip, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <Ionicons name="notifications" size={14} color="#F59E0B" style={{ marginRight: 5 }} />
              <Text style={[typography.small, { color: '#F59E0B', fontWeight: '700' }]}>
                Smart Alerts
              </Text>
            </View>
            <View style={[styles.perkChip, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <Ionicons name="trophy" size={14} color="#10B981" style={{ marginRight: 5 }} />
              <Text style={[typography.small, { color: '#10B981', fontWeight: '700' }]}>
                Full Access
              </Text>
            </View>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.xxl,
              },
            ]}
          >
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Name Field (Register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                  Your Name
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.surfaceGlass,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                >
                  <Ionicons name="person-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g. Alex Johnson"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                Email Address
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.border,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="alex@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.border,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
                  Confirm Password
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.surfaceGlass,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Repeat password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>
            )}

            {/* Primary Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={loading}
              style={{ marginTop: spacing.md }}
            >
              <LinearGradient
                colors={['#10B981', '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.submitButton, { borderRadius: borderRadius.xl }]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={mode === 'register' ? 'sparkles' : 'log-in-outline'}
                      size={20}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.submitButtonText}>
                      {mode === 'register' ? 'Register & Unlock All Features' : 'Sign In to Account'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Continue as Guest Button */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.guestContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGuest}
              style={[
                styles.guestButton,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.surfaceGlass,
                  borderRadius: borderRadius.xl,
                },
              ]}
            >
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Continue as Guest <Text style={{ color: colors.textMuted }}>(Basic Step Tracking Only)</Text>
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <Text style={[typography.small, styles.guestDisclaimer, { color: colors.textMuted }]}>
              Guests can track steps, but water tracking, smart hydration reminders, and cloud backups require an account.
            </Text>
          </Animated.View>
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
    paddingVertical: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoBox: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  tabContainer: {
    width: '100%',
    marginBottom: 14,
  },
  tabTrack: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  perkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  formCard: {
    width: '100%',
    borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  submitButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  guestContainer: {
    width: '100%',
    marginTop: 22,
    alignItems: 'center',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    width: '100%',
  },
  guestDisclaimer: {
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    fontSize: 11.5,
    lineHeight: 16,
  },
});
