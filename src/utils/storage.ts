import { Student, DailyClassLog, ClassroomConfig, UserAccount, HomeworkItem } from '../types';
import { generateInitialStudents, generateInitialDailyLog, DEFAULT_CONFIG, INITIAL_HOMEWORK } from '../data/mockStudents';

const STORAGE_KEYS = {
  STUDENTS: 'classpulse_students_13_v6',
  DAILY_LOGS: 'classpulse_daily_logs_13_v6',
  CONFIG: 'classpulse_config_13_v6',
  ACCOUNTS: 'classpulse_accounts_13_v6',
  CURRENT_USER: 'classpulse_current_user_13_v6',
  HOMEWORK: 'classpulse_homework_13_v6',
  HAS_ENTERED: 'classpulse_has_entered_13_v6',
};

export const ADMIN_ACCESS_CODE = 'ADMIN-1312';
export const ADMIN_BACKUP_CODE = '1312';

export const DEFAULT_ADMIN_ACCOUNT: UserAccount = {
  id: 'usr-admin-main',
  username: 'admin',
  password: 'admin',
  role: 'admin',
  displayName: 'Ангийн багш (Администратор)',
  parentPhone: '',
  createdAt: '2026-09-01',
};

export function loadStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading accounts:', err);
  }
  const defaults = [DEFAULT_ADMIN_ACCOUNT];
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(defaults));
  return defaults;
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving accounts:', err);
  }
}

export function loadStoredCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading current user:', err);
  }
  return null; // Return null to show registration/sign-up screen initially
}

export function saveStoredCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Error saving current user:', err);
  }
}

export function loadStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].firstName === 'Азжаргал') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading students:', err);
  }
  const initial = generateInitialStudents();
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initial));
  return initial;
}

export function saveStoredStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students:', err);
  }
}

export function loadStoredDailyLogs(students: Student[]): Record<string, DailyClassLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (!raw) {
      const today = '2026-11-09';
      const initialLog = generateInitialDailyLog(today, students);
      const logsMap: Record<string, DailyClassLog> = { [today]: initialLog };
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logsMap));
      return logsMap;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (err) {
    console.error('Error loading daily logs:', err);
  }
  const today = '2026-11-09';
  const initialLog = generateInitialDailyLog(today, students);
  const logsMap: Record<string, DailyClassLog> = { [today]: initialLog };
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logsMap));
  return logsMap;
}

export function saveStoredDailyLogs(logs: Record<string, DailyClassLog>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving daily logs:', err);
  }
}

export function loadStoredConfig(): ClassroomConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.schoolName && parsed.className) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  return DEFAULT_CONFIG;
}

export function saveStoredConfig(config: ClassroomConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

export function loadStoredHomework(): HomeworkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading homework:', err);
  }
  localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(INITIAL_HOMEWORK));
  return INITIAL_HOMEWORK;
}

export function saveStoredHomework(items: HomeworkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving homework:', err);
  }
}

export function resetAllDataToDefault(): {
  students: Student[];
  logs: Record<string, DailyClassLog>;
  config: ClassroomConfig;
  accounts: UserAccount[];
  currentUser: UserAccount;
  homework: HomeworkItem[];
} {
  const students = generateInitialStudents();
  const today = '2026-11-09';
  const initialLog = generateInitialDailyLog(today, students);
  const logs: Record<string, DailyClassLog> = { [today]: initialLog };
  const config = DEFAULT_CONFIG;
  const accounts = [DEFAULT_ADMIN_ACCOUNT];
  const currentUser = DEFAULT_ADMIN_ACCOUNT;
  const homework = INITIAL_HOMEWORK;

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(homework));

  return { students, logs, config, accounts, currentUser, homework };
}

export function exportDailyAttendanceCSV(
  date: string,
  students: Student[],
  dailyLog: DailyClassLog | undefined,
  config: ClassroomConfig
): void {
  const headers = [
    '№',
    'Сурагчийн код',
    'Овог, Нэр',
    'Хүйс',
    'Өөрийн утас',
    'Нөөц утас',
    '1-р цаг',
    '2-р цаг',
    '3-р цаг',
    '4-р цаг',
    '5-р цаг',
    '6-р цаг',
    '7-р цаг',
    'Өдрийн ирц %',
    'Дүрэмт хувцасны байдал',
    'Зөрчлийн тайлбар',
    'Ангийн багшийн тэмдэглэл',
  ];

  const rows = students.map((stu) => {
    const record = dailyLog?.records[stu.id];
    const periods = record?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };

    let presentCount = 0;
    for (let p = 1; p <= 7; p++) {
      const st = periods[p] || 'present';
      if (st === 'present' || st === 'excused') presentCount++;
      else if (st === 'late') presentCount += 0.8;
    }
    const attendancePct = Math.round((presentCount / 7) * 100);

    const uniformText =
      record?.uniform.status === 'compliant' ? 'БҮРЭН' :
      record?.uniform.status === 'partial' ? 'ДУТУУ' :
      record?.uniform.status === 'non_compliant' ? 'ЗӨРЧИЛТЭЙ' : 'ЧӨЛӨӨТЭЙ';

    const getStatusLetter = (s: string) => {
      if (s === 'present') return 'И';
      if (s === 'late') return 'Х';
      if (s === 'absent') return 'Т';
      return 'Ч';
    };

    return [
      stu.rollNumber,
      `"${stu.id}"`,
      `"${stu.lastName} ${stu.firstName}"`,
      stu.gender,
      `"${stu.fatherPhone || stu.guardianPhone}"`,
      `"${stu.motherPhone || stu.guardianPhone}"`,
      getStatusLetter(periods[1] || 'present'),
      getStatusLetter(periods[2] || 'present'),
      getStatusLetter(periods[3] || 'present'),
      getStatusLetter(periods[4] || 'present'),
      getStatusLetter(periods[5] || 'present'),
      getStatusLetter(periods[6] || 'present'),
      getStatusLetter(periods[7] || 'present'),
      `${attendancePct}%`,
      uniformText,
      `"${(record?.uniform.violationReason || '').replace(/"/g, '""')}"`,
      `"${(record?.dailyRemark || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [
    `# ${config.schoolName} - ${config.className} (${config.academicYear})`,
    `# Ангийн багш: ${config.adminName}`,
    `# Өдрийн ирцийн албан журнал - Огноо: ${date}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  downloadFile(`Irts_Jurnal_${date}.csv`, '\uFEFF' + csvContent, 'text/csv;charset=utf-8;');
}

export function exportPaymentLedgerCSV(students: Student[], config: ClassroomConfig): void {
  const headers = [
    '№',
    'Сурагчийн код',
    'Овог, Нэр',
    'Асран хамгаалагч',
    'Өөрийн утас',
    'Нөөц утас',
    'Нийт төлөх төлбөр (₮)',
    'Төлсөн дүн (₮)',
    'Үлдэгдэл дүн (₮)',
    'Төлбөрийн төлөв',
    'Төлөх эцсийн хугацаа',
    'Сүүлд төлсөн огноо',
  ];

  const rows = students.map((stu) => [
    stu.rollNumber,
    `"${stu.id}"`,
    `"${stu.lastName} ${stu.firstName}"`,
    `"${stu.guardianName}"`,
    `"${stu.fatherPhone || stu.guardianPhone}"`,
    `"${stu.motherPhone || stu.guardianPhone}"`,
    stu.payment.totalTuition,
    stu.payment.amountPaid,
    stu.payment.balanceDue,
    stu.payment.status === 'paid' ? 'ТӨЛСӨН' : stu.payment.status === 'partial' ? 'ДУТУУ' : 'ТӨЛӨӨГҮЙ',
    stu.payment.dueDate,
    stu.payment.lastPaymentDate || 'Байхгүй',
  ]);

  const csvContent = [
    `# ${config.schoolName} - ${config.className} Сургалт ба дүрэмт хувцасны төлбөрийн тайлан`,
    `# Ангийн багш: ${config.adminName}`,
    `# Огноо: ${new Date().toISOString().slice(0, 10)}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  downloadFile(`Tolbor_Taillan_${new Date().toISOString().slice(0, 10)}.csv`, '\uFEFF' + csvContent, 'text/csv;charset=utf-8;');
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
