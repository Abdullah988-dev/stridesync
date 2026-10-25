import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { DailyStepRecord } from './database';
import { kmToMiles } from '../utils/calculations';

/**
 * Generates CSV string and prompts user to share/download the file.
 */
export async function exportStepsToCsv(records: DailyStepRecord[]): Promise<boolean> {
  if (!records || records.length === 0) {
    throw new Error('No records available to export.');
  }

  // Build CSV headers and rows
  const headers = [
    'Date',
    'Steps',
    'Distance (km)',
    'Distance (mi)',
    'Calories (kcal)',
    'Active Minutes',
    'Goal Reached',
  ];

  const rows = records.map((r) => [
    r.date,
    r.steps,
    r.distanceKm.toFixed(2),
    kmToMiles(r.distanceKm).toFixed(2),
    r.calories,
    r.activeMinutes,
    r.goalReached ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  if (Platform.OS === 'web') {
    // Web CSV download
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `StrideSync_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch {
      return false;
    }
  }

  try {
    const fileName = `StrideSync_Steps_${new Date().toISOString().slice(0, 10)}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export StrideSync Step Data',
        UTI: 'public.comma-separated-values-text',
      });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw error;
  }
}
