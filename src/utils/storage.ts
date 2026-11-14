import { Student, DailyClassLog, ClassroomConfig, UserAccount } from '../types';
import { generateInitialStudents, generateInitialDailyLogsHistory, DEFAULT_CONFIG, DEFAULT_WEEKLY_TIMETABLE } from '../data/mockStudents';
import { getTodayDateString, getMongolianWeekday } from './dateUtils';

const STORAGE_KEYS = {
  STUDENTS: 'classpulse_students_13_v6',
  DAILY_LOGS: 'classpulse_daily_logs_13_v6',
  CONFIG: 'classpulse_config_13_v7',
  LEGACY_CONFIG: 'classpulse_config_13_v6',
  ACCOUNTS: 'classpulse_accounts_13_v6',
  CURRENT_USER: 'classpulse_current_user_13_v6',
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading daily logs:', err);
  }
  const initialHistory = generateInitialDailyLogsHistory(students);
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(initialHistory));
  return initialHistory;
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
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          periods: Array.isArray(parsed.periods) && parsed.periods.length > 0 ? parsed.periods : DEFAULT_CONFIG.periods,
          weeklyTimetable: {
            ...DEFAULT_WEEKLY_TIMETABLE,
            ...(parsed.weeklyTimetable || {}),
          },
        };
      }
    }

    // One-time migration from v6 config: keep school/class/admin metadata, apply newly imported timetable
    const legacyRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_CONFIG);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      const migrated: ClassroomConfig = {
        ...DEFAULT_CONFIG,
        schoolName: legacyParsed.schoolName || DEFAULT_CONFIG.schoolName,
        className: legacyParsed.className || DEFAULT_CONFIG.className,
        grade: legacyParsed.grade || DEFAULT_CONFIG.grade,
        academicYear: legacyParsed.academicYear || DEFAULT_CONFIG.academicYear,
        roomNumber: legacyParsed.roomNumber || DEFAULT_CONFIG.roomNumber,
        adminName: legacyParsed.adminName || DEFAULT_CONFIG.adminName,
        periods: DEFAULT_CONFIG.periods,
        weeklyTimetable: DEFAULT_WEEKLY_TIMETABLE,
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(migrated));
      return migrated;
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

export function resetAllDataToDefault(): {
  students: Student[];
  logs: Record<string, DailyClassLog>;
  config: ClassroomConfig;
  accounts: UserAccount[];
  currentUser: UserAccount;
} {
  const students = generateInitialStudents();
  const logs = generateInitialDailyLogsHistory(students);
  const config = DEFAULT_CONFIG;
  const accounts = [DEFAULT_ADMIN_ACCOUNT];
  const currentUser = DEFAULT_ADMIN_ACCOUNT;

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  localStorage.removeItem('classpulse_homework_13_v6');

  return { students, logs, config, accounts, currentUser };
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

export function exportAllHistoryCSV(
  dailyLogs: Record<string, DailyClassLog>,
  students: Student[],
  config: ClassroomConfig
): void {
  const sortedDates = Object.keys(dailyLogs).sort((a, b) => b.localeCompare(a));

  const headers = [
    'Огноо',
    'Гараг',
    'Баталгаажсан эсэх',
    'Нийт сурагч',
    'Бүтэн өдөр ирсэн',
    'Хоцролт/Хэсэгчлэн',
    'Бүтэн өдөр тасалсан',
    'Ирцийн хувь %',
    'Дүрэмт хувцас бүрэн',
    'Хувцасны зөрчил',
    'Өдрийн тэмдэглэл',
  ];

  const rows = sortedDates.map((date) => {
    const log = dailyLogs[date];
    let fullyPresent = 0;
    let partialPresent = 0;
    let absentWholeDay = 0;
    let uniformCompliant = 0;
    let uniformViolations = 0;

    students.forEach((stu) => {
      const rec = log?.records?.[stu.id];
      const periods = rec?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };
      let pCount = 0;
      let aCount = 0;
      for (let p = 1; p <= 7; p++) {
        const st = periods[p] || 'present';
        if (st === 'present' || st === 'excused') pCount++;
        if (st === 'absent') aCount++;
      }
      if (aCount === 7) absentWholeDay++;
      else if (pCount === 7) fullyPresent++;
      else partialPresent++;

      const uStatus = rec?.uniform?.status || 'compliant';
      if (uStatus === 'compliant' || uStatus === 'exempt') uniformCompliant++;
      else uniformViolations++;
    });

    const pct = students.length > 0 ? Math.round(((students.length - absentWholeDay) / students.length) * 100) : 100;

    return [
      date,
      getMongolianWeekday(date),
      log?.verifiedByAdmin ? 'Тийм' : 'Хадгалсан',
      students.length,
      fullyPresent,
      partialPresent,
      absentWholeDay,
      `${pct}%`,
      uniformCompliant,
      uniformViolations,
      `"${(log?.dayNotes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [
    `# ${config.schoolName} - ${config.className} (${config.academicYear})`,
    `# Ангийн багш: ${config.adminName}`,
    `# Өдөр бүрийн ирцийн түүхийн нэгтгэл (${sortedDates.length} өдөр) - Татсан огноо: ${getTodayDateString()}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  downloadFile(`Irts_Tuuh_${getTodayDateString()}.csv`, '\uFEFF' + csvContent, 'text/csv;charset=utf-8;');
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

