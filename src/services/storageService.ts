import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, SavedBarcode } from '../types';

const ALARMS_KEY = '@alarms';
const BARCODES_KEY = '@barcodes';

export const storageService = {
  async saveAlarms(alarms: Alarm[]): Promise<void> {
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  },

  async getAlarms(): Promise<Alarm[]> {
    const data = await AsyncStorage.getItem(ALARMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveBarcodes(barcodes: SavedBarcode[]): Promise<void> {
    await AsyncStorage.setItem(BARCODES_KEY, JSON.stringify(barcodes));
  },

  async getBarcodes(): Promise<SavedBarcode[]> {
    const data = await AsyncStorage.getItem(BARCODES_KEY);
    return data ? JSON.parse(data) : [];
  },
};