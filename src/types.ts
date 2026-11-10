/**
 * ClassPulse - Нийслэлийн 13-р сургууль, 12Б анги
 */

export type UserRole = 'admin' | 'student';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  studentId?: string; // e.g. 'STU-001' ... 'STU-034'
  rollNumber?: number; // 1 to 34
  displayName: string;
  parentPhone?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type UniformStatus = 'compliant' | 'non_compliant' | 'partial' | 'exempt';

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: 'Бэлнээр' | 'Дансаар / Банк' | 'Карт' | 'Шилжүүлэг';
  receiptNumber: string;
  notes?: string;
  recordedBy: string;
}

export interface FeeItem {
  id: string;
  category: string;
  amount: number;
  paid: boolean;
}

export interface StudentPaymentInfo {
  status: PaymentStatus;
  totalTuition: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  lastPaymentDate?: string;
  term: string;
  fees: FeeItem[];
  transactions: PaymentTransaction[];
}

export interface NoteEntry {
  id: string;
  date: string;
  author: string;
  category: 'Сургалт' | 'Зан байдал' | 'Эрүүл мэнд' | 'Захиргаа' | 'Чөлөө хүсэлт';
  content: string;
}

export interface Student {
  id: string; // STU-001 ... STU-034
  rollNumber: number; // 1 to 34
  firstName: string;
  lastName: string;
  gender: 'Эрэгтэй' | 'Эмэгтэй';
  dateOfBirth: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianRelation: 'Ээж' | 'Аав' | 'Асран хамгаалагч';
  guardianPhone: string;
  fatherPhone?: string;
  motherPhone?: string;
  guardianEmail: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  medicalAlerts: string;
  generalNotes: string;
  tags: string[]; // Allowed tags only; Banned: Class Monitor, Mathematics, Bus 1, Robotics, Honor Student
  payment: StudentPaymentInfo;
  notesLog: NoteEntry[];
  accountRegistered?: boolean;
}

export interface PeriodInfo {
  periodNumber: number; // 1 to 7
  name: string;
  subject: string;
  timeSlot: string;
  room: string;
  teacher: string;
}

export type WeekdayName = 'Даваа' | 'Мягмар' | 'Лхагва' | 'Пүрэв' | 'Баасан';

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  weekday: WeekdayName;
  periodNumber: number;
  dueDate: string;
  dueTime: string;
  priority: 'Яаралтай' | 'Чухал' | 'Энгийн';
  assignedDate: string;
  teacherName: string;
  completedBy: string[]; // student IDs
}

export interface StudentDailyRecord {
  periods: Record<number, AttendanceStatus>;
  uniform: {
    status: UniformStatus;
    violationReason?: string;
    inspectedAt?: string;
    resolved?: boolean;
  };
  dailyRemark?: string;
}

export interface DailyClassLog {
  date: string; // YYYY-MM-DD
  records: Record<string, StudentDailyRecord>;
  dayNotes?: string;
  verifiedByAdmin?: boolean;
  verifiedAt?: string;
}

export interface ClassroomConfig {
  className: string;
  grade: string;
  academicYear: string;
  roomNumber: string;
  adminName: string;
  schoolName: string;
  periods: PeriodInfo[];
  weeklyTimetable: Record<WeekdayName, PeriodInfo[]>;
}
