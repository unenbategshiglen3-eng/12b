import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  DailyClassLog,
  ClassroomConfig,
  UserAccount,
  NoteEntry,
  HomeworkItem,
  WeekdayName,
  PeriodInfo,
  AttendanceStatus,
  UniformStatus,
} from './types';
import {
  loadStoredStudents,
  saveStoredStudents,
  loadStoredDailyLogs,
  saveStoredDailyLogs,
  loadStoredConfig,
  saveStoredConfig,
  loadStoredAccounts,
  saveStoredAccounts,
  loadStoredCurrentUser,
  saveStoredCurrentUser,
  loadStoredHomework,
  saveStoredHomework,
  resetAllDataToDefault,
} from './utils/storage';
import { getTodayDateString, getCurrentTimeString } from './utils/dateUtils';
import { Header, AppTab } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { AttendanceMatrix } from './components/AttendanceMatrix';
import { DailyHistoryView } from './components/DailyHistoryView';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { HomeworkReminders } from './components/HomeworkReminders';
import { UniformTracker } from './components/UniformTracker';
import { StudentDirectory } from './components/StudentDirectory';
import { DailyReportPrintView } from './components/DailyReportPrintView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AuthModal } from './components/AuthModal';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';
import { DownloadAppModal } from './components/DownloadAppModal';
import { EditClassInfoModal } from './components/EditClassInfoModal';
import { StudentPortalView } from './components/StudentPortalView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { generateCleanDailyLog } from './data/mockStudents';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => loadStoredStudents());
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyClassLog>>(() =>
    loadStoredDailyLogs(loadStoredStudents())
  );
  const [config, setConfig] = useState<ClassroomConfig>(() => loadStoredConfig());
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadStoredAccounts());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadStoredCurrentUser());
  const [homework, setHomework] = useState<HomeworkItem[]>(() => loadStoredHomework());
  const [currentDate, setCurrentDate] = useState<string>(() => getTodayDateString());
  const [activeTab, setActiveTab] = useState<AppTab>('attendance');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailModalDate, setDetailModalDate] = useState<string | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isEditClassInfoOpen, setIsEditClassInfoOpen] = useState(false);

  const pwaInstall = usePWAInstall();

  // Sync state to localStorage
  useEffect(() => {
    saveStoredStudents(students);
  }, [students]);

  useEffect(() => {
    saveStoredDailyLogs(dailyLogs);
  }, [dailyLogs]);

  useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveStoredCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredHomework(homework);
  }, [homework]);

  const isAdmin = currentUser?.role === 'admin';

  // Purely derive the active day's log without mutating state during render
  const buildDailyLogSnapshot = (date: string, sourceLogs: Record<string, DailyClassLog>): DailyClassLog => {
    return sourceLogs[date] || generateCleanDailyLog(date, students);
  };

  const currentDailyLog = useMemo(
    () => dailyLogs[currentDate] || generateCleanDailyLog(currentDate, students),
    [dailyLogs, currentDate, students]
  );

  const savedDaysCount = Object.keys(dailyLogs).length;

  // Authentication handlers
  const handleLogin = (account: UserAccount) => {
    setCurrentUser(account);
    saveStoredCurrentUser(account);
  };

  const handleRegisterStudent = (newAccount: UserAccount, parentPhone?: string) => {
    const updated = [...accounts.filter((a) => a.id !== newAccount.id), newAccount];
    setAccounts(updated);
    saveStoredAccounts(updated);

    // Update student parent phone and mark registered
    if (newAccount.rollNumber) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.rollNumber === newAccount.rollNumber) {
            return {
              ...s,
              accountRegistered: true,
              phone: parentPhone || s.phone,
              fatherPhone: parentPhone || s.fatherPhone,
              guardianPhone: parentPhone || s.guardianPhone,
            };
          }
          return s;
        })
      );
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
  };

  // Update student own phone & backup phone
  const handleUpdateParentPhone = (studentId: string, fatherPhone: string, motherPhone: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, phone: fatherPhone, fatherPhone, motherPhone, guardianPhone: fatherPhone || s.guardianPhone } : s))
    );
  };

  // Update weekly timetable
  const handleUpdateWeeklyTimetable = (updatedTimetable: Record<WeekdayName, PeriodInfo[]>) => {
    setConfig((prev) => ({
      ...prev,
      weeklyTimetable: updatedTimetable,
    }));
  };

  // Save config (School name, Class name, Teacher name)
  const handleSaveConfig = (newConfig: ClassroomConfig) => {
    setConfig(newConfig);
    // Also update admin account display name if teacher name changed
    if (newConfig.adminName) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.role === 'admin'
            ? { ...acc, displayName: `${newConfig.adminName} (Администратор)` }
            : acc
        )
      );
      if (currentUser?.role === 'admin') {
        setCurrentUser((prev) =>
          prev ? { ...prev, displayName: `${newConfig.adminName} (Администратор)` } : null
        );
      }
    }
  };

  // Homework Handlers
  const handleAddHomework = (item: Omit<HomeworkItem, 'id' | 'completedBy' | 'assignedDate'>) => {
    const newItem: HomeworkItem = {
      ...item,
      id: `hw-${Date.now()}`,
      assignedDate: currentDate,
      completedBy: [],
    };
    setHomework((prev) => [newItem, ...prev]);
  };

  const handleToggleHomework = (homeworkId: string, studentId: string) => {
    setHomework((prev) =>
      prev.map((h) => {
        if (h.id !== homeworkId) return h;
        const already = h.completedBy.includes(studentId);
        return {
          ...h,
          completedBy: already
            ? h.completedBy.filter((id) => id !== studentId)
            : [...h.completedBy, studentId],
        };
      })
    );
  };

  const handleDeleteHomework = (homeworkId: string) => {
    if (!isAdmin) return;
    setHomework((prev) => prev.filter((h) => h.id !== homeworkId));
  };

  // History Management Handlers
  const handleSaveDayToHistory = (date: string, dayNotes?: string) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    const timeOnly = getCurrentTimeString();
    setDailyLogs((prev) => {
      const existing = buildDailyLogSnapshot(date, prev);
      return {
        ...prev,
        [date]: {
          ...existing,
          dayNotes: dayNotes !== undefined ? dayNotes : existing.dayNotes,
          verifiedByAdmin: true,
          verifiedAt: existing.verifiedAt || timeOnly,
          savedAt: existing.savedAt || timestamp,
          updatedAt: timestamp,
        },
      };
    });
  };

  const handleUpdateDayNotes = (date: string, dayNotes: string) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    setDailyLogs((prev) => {
      const existing = buildDailyLogSnapshot(date, prev);
      return {
        ...prev,
        [date]: {
          ...existing,
          dayNotes,
          savedAt: existing.savedAt || timestamp,
          updatedAt: timestamp,
        },
      };
    });
  };

  const handleDeleteDayHistory = (date: string) => {
    if (!isAdmin) return;
    setDailyLogs((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  };

  // Attendance Handlers (Admin exclusive)
  const handleUpdateAttendance = (
    studentId: string,
    periodNumber: number,
    status: AttendanceStatus
  ) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const existingStudentRec = existingLog.records[studentId] || {
        periods: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' },
        uniform: { status: 'compliant' },
      };

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: {
            ...existingLog.records,
            [studentId]: {
              ...existingStudentRec,
              periods: {
                ...existingStudentRec.periods,
                [periodNumber]: status,
              },
            },
          },
        },
      };
    });
  };

  const handleBulkUpdatePeriod = (periodNumber: number, status: AttendanceStatus) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const newRecords = { ...existingLog.records };

      students.forEach((stu) => {
        const rec = newRecords[stu.id] || {
          periods: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' },
          uniform: { status: 'compliant' },
        };
        newRecords[stu.id] = {
          ...rec,
          periods: {
            ...rec.periods,
            [periodNumber]: status,
          },
        };
      });

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: newRecords,
        },
      };
    });
  };

  const handleBulkUpdateStudent = (studentId: string, status: AttendanceStatus) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    const newPeriods: Record<number, AttendanceStatus> = {};
    for (let p = 1; p <= 7; p++) {
      newPeriods[p] = status;
    }

    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const rec = existingLog.records[studentId] || {
        periods: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' },
        uniform: { status: 'compliant' },
      };

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: {
            ...existingLog.records,
            [studentId]: {
              ...rec,
              periods: newPeriods,
            },
          },
        },
      };
    });
  };

  const handleBulkUpdateAll = (status: AttendanceStatus) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    const newPeriods: Record<number, AttendanceStatus> = {};
    for (let p = 1; p <= 7; p++) {
      newPeriods[p] = status;
    }

    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const newRecords = { ...existingLog.records };

      students.forEach((stu) => {
        const rec = newRecords[stu.id] || {
          periods: newPeriods,
          uniform: { status: 'compliant' },
        };
        newRecords[stu.id] = {
          ...rec,
          periods: { ...newPeriods },
        };
      });

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: newRecords,
        },
      };
    });
  };

  // Uniform Handlers (Admin exclusive)
  const handleUpdateUniform = (
    studentId: string,
    status: UniformStatus,
    reason?: string,
    resolved?: boolean
  ) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    const timeOnly = getCurrentTimeString();
    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const rec = existingLog.records[studentId] || {
        periods: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' },
        uniform: { status: 'compliant' },
      };

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: {
            ...existingLog.records,
            [studentId]: {
              ...rec,
              uniform: {
                status,
                violationReason: reason,
                inspectedAt: timeOnly,
                resolved: resolved ?? false,
              },
            },
          },
        },
      };
    });
  };

  const handleMarkAllCompliant = () => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    const timeOnly = getCurrentTimeString();
    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const newRecords = { ...existingLog.records };

      students.forEach((stu) => {
        const rec = newRecords[stu.id] || {
          periods: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' },
          uniform: { status: 'compliant' },
        };
        const isExempt = rec.uniform.status === 'exempt';
        newRecords[stu.id] = {
          ...rec,
          uniform: {
            status: isExempt ? 'exempt' : 'compliant',
            violationReason: isExempt ? rec.uniform.violationReason : undefined,
            inspectedAt: timeOnly,
          },
        };
      });

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: newRecords,
        },
      };
    });
  };

  // Daily Remark Handler
  const handleUpdateDailyRemark = (studentId: string, remark: string) => {
    if (!isAdmin) return;
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const rec = existingLog.records[studentId] || {
        periods: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' },
        uniform: { status: 'compliant' },
      };

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: {
            ...existingLog.records,
            [studentId]: {
              ...rec,
              dailyRemark: remark,
            },
          },
        },
      };
    });
  };

  // Student Profile Updates
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setSelectedStudent(updatedStudent);
  };

  const handleAddStudent = (newStudent: Student) => {
    if (!isAdmin) return;
    setStudents((prev) => [...prev, newStudent]);
    const defaultPeriods: Record<number, AttendanceStatus> = {
      1: 'present',
      2: 'present',
      3: 'present',
      4: 'present',
      5: 'present',
      6: 'present',
      7: 'present',
    };
    const timestamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: {
            ...existingLog.records,
            [newStudent.id]: {
              periods: defaultPeriods,
              uniform: { status: 'compliant' as const },
            },
          },
        },
      };
    });
  };

  // Student messaging / leave request note
  const handleSendStudentNote = (studentId: string, noteText: string) => {
    const authorName = currentUser?.displayName || 'Сурагч';
    const todayStr = getTodayDateString();
    const newEntry: NoteEntry = {
      id: `note-${studentId}-${Date.now()}`,
      date: todayStr,
      author: authorName,
      category: 'Чөлөө хүсэлт',
      content: noteText,
    };

    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id !== studentId) return stu;
        return {
          ...stu,
          notesLog: [newEntry, ...stu.notesLog],
        };
      })
    );

    // Also attach leave request remark directly to today's daily log
    const timestamp = `${todayStr} ${getCurrentTimeString()}`;
    setDailyLogs((prev) => {
      const existingLog = buildDailyLogSnapshot(currentDate, prev);
      const rec = existingLog.records[studentId] || {
        periods: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' },
        uniform: { status: 'compliant' },
      };

      return {
        ...prev,
        [currentDate]: {
          ...existingLog,
          savedAt: existingLog.savedAt || timestamp,
          updatedAt: timestamp,
          records: {
            ...existingLog.records,
            [studentId]: {
              ...rec,
              dailyRemark: `[Чөлөө хүсэлт]: ${noteText}`,
            },
          },
        },
      };
    });
  };

  const handleResetData = () => {
    const { students: resetStudents, logs: resetLogs, config: resetConfig, accounts: resetAccounts, currentUser: resetUser, homework: resetHomework } = resetAllDataToDefault();
    setStudents(resetStudents);
    setDailyLogs(resetLogs);
    setConfig(resetConfig);
    setAccounts(resetAccounts);
    setCurrentUser(resetUser);
    setHomework(resetHomework);
    setSelectedStudent(null);
  };

  const buildBackupJson = () =>
    JSON.stringify(
      {
        exportedAt: `${getTodayDateString()} ${getCurrentTimeString()}`,
        config,
        students,
        dailyLogs,
        homework,
      },
      null,
      2
    );

  // If user is not yet logged in: Render Registration / Sign-up Screen at the beginning of the app
  if (!currentUser) {
    return (
      <>
        <OfflineIndicator />
        <WelcomeAuthScreen
          config={config}
          students={students}
          accounts={accounts}
          onLogin={handleLogin}
          onRegisterStudent={handleRegisterStudent}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />
        <DownloadAppModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          pwaInstall={pwaInstall}
          onExportBackup={buildBackupJson}
        />
      </>
    );
  }

  // Find student profile if a student is logged in
  const loggedInStudent = !isAdmin && currentUser.rollNumber
    ? students.find((s) => s.rollNumber === currentUser.rollNumber) || students[0]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <OfflineIndicator />

      {/* Top Navigation Bar with Blue Highlights */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        currentUser={currentUser}
        studentsCount={students.length}
        savedDaysCount={savedDaysCount}
        isAppInstalled={pwaInstall.isInstalled}
        isAppInstallable={pwaInstall.isInstallable}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onQuickAction={() => setIsAddStudentOpen(true)}
        onOpenEditClassInfo={() => setIsEditClassInfoOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* If logged in as Student: Show dedicated Student Self-Service Portal View */}
        {!isAdmin && loggedInStudent ? (
          <StudentPortalView
            student={loggedInStudent}
            dailyLog={currentDailyLog}
            dailyLogs={dailyLogs}
            config={config}
            currentDate={currentDate}
            homework={homework}
            onSendStudentNote={handleSendStudentNote}
            onUpdateParentPhone={handleUpdateParentPhone}
            onToggleCompleteHomework={handleToggleHomework}
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          />
        ) : (
          /* Administrator View */
          <>
            {/* KPI Summary Strip & Date Selector */}
            {activeTab !== 'reports' && activeTab !== 'schedule' && activeTab !== 'homework' && activeTab !== 'history' && (
              <StatsOverview
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                students={students}
                dailyLog={currentDailyLog}
                isDateSavedInHistory={Boolean(dailyLogs[currentDate])}
                savedDaysCount={savedDaysCount}
                config={config}
                currentUser={currentUser}
                onNavigateTab={setActiveTab}
                onOpenEditClassInfo={() => setIsEditClassInfoOpen(true)}
                onSaveDayToHistory={(date) => handleSaveDayToHistory(date)}
              />
            )}

            {/* Tab 1: 7-Period Attendance Matrix */}
            {activeTab === 'attendance' && (
              <AttendanceMatrix
                students={students}
                dailyLog={currentDailyLog}
                periods={config.periods}
                isAdmin={isAdmin}
                onUpdateAttendance={handleUpdateAttendance}
                onBulkUpdatePeriod={handleBulkUpdatePeriod}
                onBulkUpdateStudent={handleBulkUpdateStudent}
                onBulkUpdateAll={handleBulkUpdateAll}
                onSelectStudent={(stu) => {
                  setDetailModalDate(null);
                  setSelectedStudent(stu);
                }}
                onUpdateDailyRemark={handleUpdateDailyRemark}
              />
            )}

            {/* Tab 1B: Daily History & Archive Viewer */}
            {activeTab === 'history' && (
              <DailyHistoryView
                students={students}
                dailyLogs={dailyLogs}
                config={config}
                currentDate={currentDate}
                isAdmin={isAdmin}
                onSelectDateToEdit={(date) => {
                  setCurrentDate(date);
                  setActiveTab('attendance');
                }}
                onOpenReportForDate={(date) => {
                  setCurrentDate(date);
                  setActiveTab('reports');
                }}
                onSaveDayToHistory={handleSaveDayToHistory}
                onUpdateDayNotes={handleUpdateDayNotes}
                onDeleteDayHistory={handleDeleteDayHistory}
                onSelectStudent={(stu, date) => {
                  setDetailModalDate(date || null);
                  setSelectedStudent(stu);
                }}
              />
            )}

            {/* Tab 2: 5-Day Weekly Class Schedule (Даваа - Баасан) */}
            {activeTab === 'schedule' && (
              <WeeklyScheduleView
                config={config}
                isAdmin={isAdmin}
                onUpdateWeeklyTimetable={handleUpdateWeeklyTimetable}
              />
            )}

            {/* Tab 3: Homework Reminders & SMS notifications */}
            {activeTab === 'homework' && (
              <HomeworkReminders
                homework={homework}
                studentsCount={students.length}
                isAdmin={isAdmin}
                currentStudentId={currentUser?.studentId}
                onAddHomework={handleAddHomework}
                onToggleComplete={handleToggleHomework}
                onDeleteHomework={handleDeleteHomework}
              />
            )}

            {/* Tab 4: Uniform Inspection */}
            {activeTab === 'uniform' && (
              <UniformTracker
                students={students}
                dailyLog={currentDailyLog}
                currentDate={currentDate}
                config={config}
                isAdmin={isAdmin}
                onUpdateUniform={handleUpdateUniform}
                onMarkAllCompliant={handleMarkAllCompliant}
                onSelectStudent={(stu) => {
                  setDetailModalDate(null);
                  setSelectedStudent(stu);
                }}
              />
            )}

            {/* Tab 5: Student Directory & Records */}
            {activeTab === 'directory' && (
              <StudentDirectory
                students={students}
                className={config.className}
                isAdmin={isAdmin}
                onSelectStudent={(stu) => {
                  setDetailModalDate(null);
                  setSelectedStudent(stu);
                }}
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
              />
            )}

            {/* Tab 6: Daily Register & Print Sheet */}
            {activeTab === 'reports' && (
              <DailyReportPrintView
                students={students}
                dailyLog={currentDailyLog}
                currentDate={currentDate}
                config={config}
                onResetData={handleResetData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer in Mongolian */}
      <footer className="mt-auto border-t border-blue-100 bg-white py-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-900">{config.schoolName}</span>
            <span aria-hidden="true">·</span>
            <span>{config.className}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{students.length} Сурагч</span>
            <span aria-hidden="true">·</span>
            <span>5 өдрийн 7 цагийн цахим хуваарь</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              {pwaInstall.isInstalled ? 'Апп суусан ✓' : 'Апп суулгах (PWA)'}
            </button>
            <span aria-hidden="true">·</span>
            <span>Нэвтэрсэн:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {currentUser.displayName} ({isAdmin ? 'Администратор' : 'Сурагч'})
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          dailyLog={detailModalDate && dailyLogs[detailModalDate] ? dailyLogs[detailModalDate] : currentDailyLog}
          periods={config.periods}
          adminName={config.adminName}
          isAdmin={isAdmin}
          onClose={() => {
            setSelectedStudent(null);
            setDetailModalDate(null);
          }}
          onUpdateStudent={handleUpdateStudent}
        />
      )}

      {isAddStudentOpen && isAdmin && (
        <AddStudentModal
          currentCount={students.length}
          onClose={() => setIsAddStudentOpen(false)}
          onAddStudent={handleAddStudent}
        />
      )}

      {/* Auth / Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        accounts={accounts}
        students={students}
        onLogin={handleLogin}
        onRegisterStudent={handleRegisterStudent}
      />

      {/* Edit School & Class Info Modal */}
      <EditClassInfoModal
        isOpen={isEditClassInfoOpen}
        onClose={() => setIsEditClassInfoOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* PWA Install & Backup Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        pwaInstall={pwaInstall}
        onExportBackup={buildBackupJson}
      />
    </div>
  );
}
