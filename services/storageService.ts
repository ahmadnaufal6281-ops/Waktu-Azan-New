
import { User, AttendanceRecord, QRSession } from "../types";

const KEYS = {
  USERS: 'qa_users',
  ATTENDANCE: 'qa_attendance',
  SESSIONS: 'qa_sessions',
  CURRENT_USER: 'qa_current_user'
};

const MOCK_USERS: User[] = [
  { id: '1', name: 'Ahmad Fauzi', email: 'ahmad@example.com', role: 'admin', department: 'IT Support' },
  { id: '2', name: 'Siti Aminah', email: 'siti@example.com', role: 'student', department: 'Accounting' },
  { id: '3', name: 'Budi Hartono', email: 'budi@example.com', role: 'student', department: 'Marketing' },
  { id: '4', name: 'Dewi Lestari', email: 'dewi@example.com', role: 'student', department: 'Human Resources' },
];

export const storage = {
  init: () => {
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem(KEYS.ATTENDANCE)) {
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.SESSIONS)) {
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify([]));
    }
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  
  getAttendance: (): AttendanceRecord[] => JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]'),
  
  saveAttendance: (record: AttendanceRecord) => {
    const records = storage.getAttendance();
    // Prevent duplicate attendance for same user on same day
    const exists = records.find(r => r.userId === record.userId && r.date === record.date);
    if (exists) return false;
    
    records.unshift(record);
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
    return true;
  },

  getSessions: (): QRSession[] => JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]'),
  
  createSession: (title: string): QRSession => {
    const sessions = storage.getSessions();
    const newSession: QRSession = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      createdAt: Date.now(),
      expiresAt: Date.now() + (1000 * 60 * 30), // 30 minutes
      createdBy: 'Admin'
    };
    sessions.unshift(newSession);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
    return newSession;
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : MOCK_USERS[0]; // Default to first user for demo
  },

  setCurrentUser: (user: User) => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }
};
