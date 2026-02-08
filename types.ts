
export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    hijri: {
      day: string;
      month: { en: string; ar: string };
      year: string;
      designation: { expanded: string };
    };
  };
  meta: {
    method: { name: string };
    timezone: string;
  };
}

export interface AppState {
  loading: boolean;
  error: string | null;
  prayerData: PrayerData | null;
  currentTime: Date;
  location: { city: string; country: string } | null;
  adhanEnabled: boolean;
}

// Fix: Adding missing User type for attendance and layout components
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'staff';
  department: string;
  avatar?: string;
}

// Fix: Adding missing AttendanceRecord type for attendance tracking and Gemini insights
export interface AttendanceRecord {
  userId: string;
  userName: string;
  status: 'Hadir' | 'Telat' | 'Izin' | 'Alpa';
  date: string;
  time: string;
}

// Fix: Adding missing QRSession type for QR code generation sessions
export interface QRSession {
  id: string;
  title: string;
  createdAt: number;
  expiresAt: number;
  createdBy: string;
}

// Fix: Adding missing CardElement and GameCard types for the card game
export type CardElement = 'Plasma' | 'Void' | 'Quantum' | 'Core';

export interface GameCard {
  id: string;
  name: string;
  element: CardElement;
  power: number;
  intelligence: number;
  agility: number;
  image: string;
  rarity: string;
  description: string;
}

// Fix: Adding missing AIResponse type for Gemini game reactions
export interface AIResponse {
  cardName: string;
  element: string;
  stats: {
    power: number;
    intelligence: number;
    agility: number;
  };
  narrative: string;
}
