import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nativeStepService } from '../services/nativeStepService';
import { useAppTheme } from '../theme/themeContext';
import { triggerHaptic } from '../utils/soundHaptics';

interface HiddenDebugModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HiddenDebugModal: React.FC<HiddenDebugModalProps> = ({ visible, onClose }) => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<{
    rawSensor: number;
    baseline: number;
    todaySteps: number;
    lastUpdateTime: number;
    isServiceRunning: boolean;
    rebootDetected: boolean;
    listenerCount: number;
    recentEvents: any[];
  } | null>(null);

  const loadDebugInfo = async () => {
    setLoading(true);
    try {
      const data = await nativeStepService.getDebugInfo();
      setDebugData(data);
    } catch (e) {
      console.warn('Failed to fetch debug telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadDebugInfo();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="hardware-chip-outline" size={24} color="#10B981" style={{ marginRight: 8 }} />
              <View>
                <Text style={[typography.h3, { color: colors.text }]}>Hardware Step Telemetry</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>STEP_SERVICE Internal Debugger</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 30 }} />
            ) : debugData ? (
              <>
                {/* Status Badges */}
                <View style={styles.badgesRow}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: debugData.isServiceRunning
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                        borderColor: debugData.isServiceRunning ? '#10B981' : '#EF4444',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: debugData.isServiceRunning ? '#10B981' : '#EF4444' },
                      ]}
                    />
                    <Text
                      style={[
                        typography.caption,
                        { fontWeight: '700', color: debugData.isServiceRunning ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {debugData.isServiceRunning ? 'Foreground Service: ACTIVE' : 'Service: IDLE / ENGINE'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          debugData.listenerCount === 1
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(234, 179, 8, 0.15)',
                        borderColor: debugData.listenerCount === 1 ? '#10B981' : '#EAB308',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        { fontWeight: '700', color: debugData.listenerCount === 1 ? '#10B981' : '#EAB308' },
                      ]}
                    >
                      Listener Count: {debugData.listenerCount} (Singleton)
                    </Text>
                  </View>
                </View>

                {/* Key Metrics Grid */}
                <View style={styles.grid}>
                  <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Raw Sensor (Chip)</Text>
                    <Text style={[typography.h2, { color: '#38BDF8' }]}>{debugData.rawSensor.toLocaleString()}</Text>
                  </View>

                  <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Day Baseline</Text>
                    <Text style={[typography.h2, { color: colors.text }]}>{debugData.baseline.toLocaleString()}</Text>
                  </View>

                  <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Today Computed Steps</Text>
                    <Text style={[typography.h2, { color: '#10B981' }]}>{debugData.todaySteps.toLocaleString()}</Text>
                  </View>

                  <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Reboot Detected</Text>
                    <Text
                      style={[
                        typography.h3,
                        { color: debugData.rebootDetected ? '#F59E0B' : colors.textSecondary },
                      ]}
                    >
                      {debugData.rebootDetected ? 'YES (Preserved)' : 'NO (Normal)'}
                    </Text>
                  </View>
                </View>

                {/* Timestamp */}
                <Text style={[typography.small, { color: colors.textMuted, marginVertical: 8 }]}>
                  Last Hardware Telemetry Update:{' '}
                  {new Date(debugData.lastUpdateTime || Date.now()).toLocaleTimeString()}
                </Text>

                {/* Formula verification note */}
                <View
                  style={[
                    styles.formulaBox,
                    { backgroundColor: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.25)' },
                  ]}
                >
                  <Text style={[typography.caption, { fontWeight: '700', color: '#0284C7' }]}>Idempotent Sensor Formula:</Text>
                  <Text style={[typography.caption, { color: colors.text, marginTop: 2 }]}>
                    todaySteps = (rawSensor: {debugData.rawSensor} - baseline: {debugData.baseline}) = {debugData.todaySteps}
                  </Text>
                </View>

                {/* Event Logs */}
                <Text style={[typography.bodyBold, { color: colors.text, marginTop: 14, marginBottom: 6 }]}>
                  Last 50 Sensor Events
                </Text>

                {debugData.recentEvents && debugData.recentEvents.length > 0 ? (
                  debugData.recentEvents.map((evt, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.logRow,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.caption, { fontWeight: '700', color: colors.text }]}>
                          Type: {evt.type}
                        </Text>
                        <Text style={[typography.small, { color: colors.textSecondary }]}>
                          Raw: {evt.rawSensorValue} | Computed: {evt.computedSteps} | Delta: +{evt.delta}
                        </Text>
                      </View>
                      <Text style={[typography.small, { color: colors.textMuted }]}>
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Listening for hardware step counter events...
                  </Text>
                )}
              </>
            ) : null}
          </ScrollView>

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                loadDebugInfo();
              }}
              style={[styles.btn, { backgroundColor: '#10B981' }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Refresh Telemetry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.btn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  formulaBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
