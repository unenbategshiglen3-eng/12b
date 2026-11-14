import React, { useMemo, useState, useEffect } from 'react';
import { Student, DailyClassLog, ClassroomConfig, AttendanceStatus } from '../types';
import { generateCleanDailyLog } from '../data/mockStudents';
import {
  getCalendarCellsForMonth,
  getMongolianMonthTitle,
  getMongolianWeekday,
  getTodayDateString,
} from '../utils/dateUtils';
import { exportDailyAttendanceCSV, exportAllHistoryCSV } from '../utils/storage';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  History,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  BookmarkCheck,
  Users,
  Clock,
} from 'lucide-react';

interface DailyHistoryViewProps {
  students: Student[];
  dailyLogs: Record<string, DailyClassLog>;
  config: ClassroomConfig;
  currentDate: string;
  isAdmin: boolean;
  onSelectDateToEdit: (date: string) => void;
  onOpenReportForDate: (date: string) => void;
  onSaveDayToHistory: (date: string, dayNotes?: string) => void;
  onUpdateDayNotes: (date: string, dayNotes: string) => void;
  onDeleteDayHistory: (date: string) => void;
  onSelectStudent: (student: Student, date?: string) => void;
}

interface DaySummaryStats {
  date: string;
  weekday: string;
  fullyPresent: number;
  partialPresent: number;
  absentWholeDay: number;
  totalLatePeriods: number;
  totalAbsentPeriods: number;
  totalExcusedPeriods: number;
  attendancePct: number;
  uniformCompliant: number;
  uniformViolations: number;
  uniformPct: number;
  periodCounts: Record<number, { p: number; l: number; a: number; e: number }>;
}

function computeDayStats(date: string, log: DailyClassLog | undefined, students: Student[]): DaySummaryStats {
  let fullyPresent = 0;
  let partialPresent = 0;
  let absentWholeDay = 0;
  let totalLatePeriods = 0;
  let totalAbsentPeriods = 0;
  let totalExcusedPeriods = 0;
  let uniformCompliant = 0;
  let uniformViolations = 0;

  const periodCounts: Record<number, { p: number; l: number; a: number; e: number }> = {
    1: { p: 0, l: 0, a: 0, e: 0 },
    2: { p: 0, l: 0, a: 0, e: 0 },
    3: { p: 0, l: 0, a: 0, e: 0 },
    4: { p: 0, l: 0, a: 0, e: 0 },
    5: { p: 0, l: 0, a: 0, e: 0 },
    6: { p: 0, l: 0, a: 0, e: 0 },
    7: { p: 0, l: 0, a: 0, e: 0 },
  };

  students.forEach((stu) => {
    const rec = log?.records?.[stu.id];
    const periods = rec?.periods || {
      1: 'present',
      2: 'present',
      3: 'present',
      4: 'present',
      5: 'present',
      6: 'present',
      7: 'present',
    };

    let pCount = 0;
    let aCount = 0;

    for (let p = 1; p <= 7; p++) {
      const st = periods[p] || 'present';
      if (st === 'present') {
        pCount++;
        periodCounts[p].p++;
      } else if (st === 'excused') {
        pCount++;
        totalExcusedPeriods++;
        periodCounts[p].e++;
      } else if (st === 'late') {
        totalLatePeriods++;
        periodCounts[p].l++;
      } else if (st === 'absent') {
        aCount++;
        totalAbsentPeriods++;
        periodCounts[p].a++;
      }
    }

    if (aCount === 7) absentWholeDay++;
    else if (pCount === 7) fullyPresent++;
    else partialPresent++;

    const uStatus = rec?.uniform?.status || 'compliant';
    if (uStatus === 'compliant' || uStatus === 'exempt') uniformCompliant++;
    else uniformViolations++;
  });

  const total = students.length || 1;
  const attendancePct = Math.round(((total - absentWholeDay) / total) * 100);
  const uniformPct = Math.round((uniformCompliant / total) * 100);

  return {
    date,
    weekday: getMongolianWeekday(date),
    fullyPresent,
    partialPresent,
    absentWholeDay,
    totalLatePeriods,
    totalAbsentPeriods,
    totalExcusedPeriods,
    attendancePct,
    uniformCompliant,
    uniformViolations,
    uniformPct,
    periodCounts,
  };
}

export const DailyHistoryView: React.FC<DailyHistoryViewProps> = ({
  students,
  dailyLogs,
  config,
  currentDate,
  isAdmin,
  onSelectDateToEdit,
  onOpenReportForDate,
  onSaveDayToHistory,
  onUpdateDayNotes,
  onDeleteDayHistory,
  onSelectStudent,
}) => {
  const sortedSavedDates = useMemo(
    () => Object.keys(dailyLogs).sort((a, b) => b.localeCompare(a)),
    [dailyLogs]
  );

  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => {
    if (dailyLogs[currentDate]) return currentDate;
    return sortedSavedDates[0] || currentDate || getTodayDateString();
  });

  const [viewMode, setViewMode] = useState<'by_day' | 'by_student'>('by_day');
  const [newLogDate, setNewLogDate] = useState<string>(currentDate || getTodayDateString());
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState<'all' | 'absent' | 'late' | 'excused' | 'uniform'>('all');
  const [dayNoteDraft, setDayNoteDraft] = useState('');
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [confirmDeleteDate, setConfirmDeleteDate] = useState<string | null>(null);

  // Student cumulative mode state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSort, setStudentSort] = useState<'roll' | 'attendance_asc' | 'absent_desc'>('roll');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Calendar state based on selectedHistoryDate
  const [calendarYear, setCalendarYear] = useState<number>(() => {
    const y = Number((selectedHistoryDate || getTodayDateString()).split('-')[0]);
    return isNaN(y) ? 2026 : y;
  });
  const [calendarMonth, setCalendarMonth] = useState<number>(() => {
    const m = Number((selectedHistoryDate || getTodayDateString()).split('-')[1]);
    return isNaN(m) ? 10 : m - 1;
  });

  useEffect(() => {
    setDayNoteDraft(dailyLogs[selectedHistoryDate]?.dayNotes || '');
    setConfirmDeleteDate(null);
  }, [selectedHistoryDate, dailyLogs]);

  const calendarCells = useMemo(
    () => getCalendarCellsForMonth(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  );

  const shiftCalendarMonth = (delta: number) => {
    const dt = new Date(Date.UTC(calendarYear, calendarMonth + delta, 1));
    setCalendarYear(dt.getUTCFullYear());
    setCalendarMonth(dt.getUTCMonth());
  };

  // Compute summary stats across all saved days
  const allSavedDayStats = useMemo(() => {
    const map: Record<string, DaySummaryStats> = {};
    sortedSavedDates.forEach((d) => {
      map[d] = computeDayStats(d, dailyLogs[d], students);
    });
    return map;
  }, [sortedSavedDates, dailyLogs, students]);

  const overallArchiveMetrics = useMemo(() => {
    const count = sortedSavedDates.length;
    if (count === 0) {
      return {
        totalDays: 0,
        avgAttendancePct: 100,
        avgUniformPct: 100,
        totalLatePeriods: 0,
        totalAbsentPeriods: 0,
      };
    }

    let sumAtt = 0;
    let sumUni = 0;
    let sumLate = 0;
    let sumAbs = 0;

    sortedSavedDates.forEach((d) => {
      const st = allSavedDayStats[d];
      sumAtt += st.attendancePct;
      sumUni += st.uniformPct;
      sumLate += st.totalLatePeriods;
      sumAbs += st.totalAbsentPeriods;
    });

    return {
      totalDays: count,
      avgAttendancePct: Math.round(sumAtt / count),
      avgUniformPct: Math.round(sumUni / count),
      totalLatePeriods: sumLate,
      totalAbsentPeriods: sumAbs,
    };
  }, [sortedSavedDates, allSavedDayStats]);

  const isSelectedDateSaved = Boolean(dailyLogs[selectedHistoryDate]);
  const selectedLog: DailyClassLog = useMemo(() => {
    return dailyLogs[selectedHistoryDate] || generateCleanDailyLog(selectedHistoryDate, students);
  }, [dailyLogs, selectedHistoryDate, students]);

  const selectedDayStats = useMemo(
    () => allSavedDayStats[selectedHistoryDate] || computeDayStats(selectedHistoryDate, selectedLog, students),
    [allSavedDayStats, selectedHistoryDate, selectedLog, students]
  );

  const filteredDayStudents = useMemo(() => {
    return students.filter((stu) => {
      const fullName = `${stu.lastName} ${stu.firstName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        stu.rollNumber.toString() === searchQuery.trim() ||
        stu.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const rec = selectedLog.records[stu.id];
      const periods = rec?.periods || {};
      const values = Object.values(periods);

      if (dayFilter === 'absent') return values.some((v) => v === 'absent');
      if (dayFilter === 'late') return values.some((v) => v === 'late');
      if (dayFilter === 'excused') return values.some((v) => v === 'excused');
      if (dayFilter === 'uniform') {
        return rec?.uniform?.status === 'non_compliant' || rec?.uniform?.status === 'partial';
      }
      return true;
    });
  }, [students, searchQuery, selectedLog, dayFilter]);

  // Multi-day cumulative summary per student
  const studentCumulativeRows = useMemo(() => {
    const totalDays = sortedSavedDates.length;
    return students
      .map((stu) => {
        let presentPeriods = 0;
        let latePeriods = 0;
        let absentPeriods = 0;
        let excusedPeriods = 0;
        let uniformViolationDays = 0;

        sortedSavedDates.forEach((d) => {
          const rec = dailyLogs[d]?.records?.[stu.id];
          const pMap = rec?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };
          for (let p = 1; p <= 7; p++) {
            const st = pMap[p] || 'present';
            if (st === 'present') presentPeriods++;
            else if (st === 'late') latePeriods++;
            else if (st === 'absent') absentPeriods++;
            else if (st === 'excused') excusedPeriods++;
          }
          const uSt = rec?.uniform?.status || 'compliant';
          if (uSt === 'non_compliant' || uSt === 'partial') uniformViolationDays++;
        });

        const totalPeriods = totalDays * 7;
        const attendedPeriods = presentPeriods + excusedPeriods + latePeriods * 0.8;
        const attendancePct = totalPeriods > 0 ? Math.round((attendedPeriods / totalPeriods) * 100) : 100;

        return {
          student: stu,
          totalDays,
          totalPeriods,
          presentPeriods,
          latePeriods,
          absentPeriods,
          excusedPeriods,
          uniformViolationDays,
          attendancePct,
        };
      })
      .filter((row) => {
        const q = studentSearch.trim().toLowerCase();
        if (!q) return true;
        const fullName = `${row.student.lastName} ${row.student.firstName}`.toLowerCase();
        return (
          fullName.includes(q) ||
          String(row.student.rollNumber) === q ||
          row.student.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (studentSort === 'attendance_asc') {
          return a.attendancePct - b.attendancePct || a.student.rollNumber - b.student.rollNumber;
        }
        if (studentSort === 'absent_desc') {
          return b.absentPeriods - a.absentPeriods || a.student.rollNumber - b.student.rollNumber;
        }
        return a.student.rollNumber - b.student.rollNumber;
      });
  }, [students, sortedSavedDates, dailyLogs, studentSearch, studentSort]);

  const handleSelectDate = (dateStr: string) => {
    setSelectedHistoryDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      setCalendarYear(y);
      setCalendarMonth(m - 1);
    }
  };

  const handleAddOrSaveDate = () => {
    if (!newLogDate) return;
    onSaveDayToHistory(newLogDate);
    handleSelectDate(newLogDate);
  };

  const handleSaveDayNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onUpdateDayNotes(selectedHistoryDate, dayNoteDraft.trim());
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2500);
  };

  const getPeriodBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return { text: 'И', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'late':
        return { text: 'Х', cls: 'bg-amber-50 text-amber-800 border-amber-200 font-bold' };
      case 'absent':
        return { text: 'Т', cls: 'bg-rose-50 text-rose-800 border-rose-200 font-bold' };
      case 'excused':
        return { text: 'Ч', cls: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Archive Header & Add Day Control */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
              <span>{config.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>{config.className}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{sortedSavedDates.length} өдрийн архив</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>Өдөр бүрийн ирц, тэмдэглэлийн түүх</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <input
                  type="date"
                  value={newLogDate}
                  onChange={(e) => e.target.value && setNewLogDate(e.target.value)}
                  className="font-mono text-xs px-2 py-1 bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                />
                <button
                  onClick={handleAddOrSaveDate}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Өдөр хадгалах
                </button>
              </div>
            )}

            <button
              onClick={() => exportAllHistoryCSV(dailyLogs, students, config)}
              disabled={sortedSavedDates.length === 0}
              className="px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Бүх түүх CSV татах
            </button>
          </div>
        </div>

        {/* 4-Column Archive KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block">Хадгалагдсан өдөр</span>
            <span className="text-xl font-bold font-mono tabular-nums text-blue-700 mt-0.5 block">
              {overallArchiveMetrics.totalDays} өдөр
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block">Дундаж ирцийн хувь</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
              {overallArchiveMetrics.avgAttendancePct}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block">Нийт таслалт / хоцролт</span>
            <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-1 flex items-center gap-2">
              <span className="text-rose-700">{overallArchiveMetrics.totalAbsentPeriods} Т</span>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="text-amber-700">{overallArchiveMetrics.totalLatePeriods} Х</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block">Дүрэмт хувцас дундаж</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
              {overallArchiveMetrics.avgUniformPct}%
            </span>
          </div>
        </div>

        {/* View Mode Segmented Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('by_day')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'by_day'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Өдөр бүрээр харах
            </button>
            <button
              onClick={() => setViewMode('by_student')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'by_student'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Сурагч бүрээр (Нийт өдрийн тайлан)
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Хадгалсан өдөр бүрийг календар болон жагсаалтаас сонгож дэлгэрэнгүй харах боломжтой.
          </div>
        </div>
      </div>

      {/* MODE 1: BY DAY (CALENDAR + SAVED LIST + DAY DETAIL INSPECTOR) */}
      {viewMode === 'by_day' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Month Calendar + Saved Days List */}
          <div className="lg:col-span-4 space-y-4">
            {/* Month Calendar Picker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => shiftCalendarMonth(-1)}
                  aria-label="Өмнөх сар"
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-bold text-slate-900">
                  {getMongolianMonthTitle(calendarYear, calendarMonth)}
                </div>
                <button
                  onClick={() => shiftCalendarMonth(1)}
                  aria-label="Дараагийн сар"
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 mb-1.5">
                {['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'].map((wd) => (
                  <div key={wd} className="py-1">
                    {wd}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  if (!cell.dateStr || !cell.dayNumber) {
                    return <div key={`empty-${idx}`} className="h-10" />;
                  }

                  const isSaved = Boolean(dailyLogs[cell.dateStr]);
                  const isSelected = selectedHistoryDate === cell.dateStr;
                  const stats = allSavedDayStats[cell.dateStr];
                  const isToday = cell.dateStr === getTodayDateString();

                  let indicatorColor = 'bg-slate-300';
                  if (stats) {
                    if (stats.attendancePct >= 95) indicatorColor = 'bg-emerald-500';
                    else if (stats.attendancePct >= 85) indicatorColor = 'bg-amber-500';
                    else indicatorColor = 'bg-rose-500';
                  }

                  return (
                    <button
                      key={cell.dateStr}
                      onClick={() => handleSelectDate(cell.dateStr!)}
                      className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-mono tabular-nums transition-colors relative border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : isSaved
                          ? 'bg-blue-50/70 text-blue-950 border-blue-200 hover:bg-blue-100 font-bold'
                          : cell.isWeekend
                          ? 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                          : 'bg-white text-slate-700 border-transparent hover:bg-slate-100'
                      }`}
                      title={
                        isSaved && stats
                          ? `${cell.dateStr} (${stats.weekday}) — Ирц: ${stats.attendancePct}%`
                          : `${cell.dateStr} — Хадгалаагүй өдөр`
                      }
                    >
                      <span>{cell.dayNumber}</span>
                      {isSaved && (
                        <span
                          className={`w-4 h-1 rounded-full mt-0.5 ${
                            isSelected ? 'bg-white' : indicatorColor
                          }`}
                        />
                      )}
                      {isToday && !isSelected && (
                        <span className="text-[8px] font-sans font-bold text-blue-600 leading-none">
                          Өнөөдөр
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block" />
                  <span>95%+</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-amber-500 inline-block" />
                  <span>85–94%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-rose-500 inline-block" />
                  <span>&lt;85%</span>
                </span>
                <span className="text-blue-700 font-semibold">Хадгалсан өдөр</span>
              </div>
            </div>

            {/* Chronological Saved Days List */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900">
                  Хадгалсан өдрүүдийн жагсаалт ({sortedSavedDates.length})
                </h2>
                <span className="text-[11px] text-slate-400">Шинээс хуучин руу</span>
              </div>

              {sortedSavedDates.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                  <p>Одоогоор хадгалсан өдөр алга байна.</p>
                  {isAdmin && (
                    <button
                      onClick={() => onSaveDayToHistory(selectedHistoryDate)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                    >
                      Эхний өдөр хадгалах
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                  {sortedSavedDates.map((d) => {
                    const st = allSavedDayStats[d];
                    const log = dailyLogs[d];
                    const isActive = d === selectedHistoryDate;

                    return (
                      <button
                        key={d}
                        onClick={() => handleSelectDate(d)}
                        className={`w-full text-left px-4 py-3 transition-colors flex flex-col gap-1 ${
                          isActive ? 'bg-blue-50/90' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs font-bold tabular-nums ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>
                              {d}
                            </span>
                            <span className="text-xs text-slate-500">
                              {st.weekday}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-mono font-bold tabular-nums ${
                              st.attendancePct >= 95
                                ? 'text-emerald-700'
                                : st.attendancePct >= 85
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {st.attendancePct}% ирц
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                          <span>
                            Хувцас: {st.uniformPct}% · {st.totalAbsentPeriods} Т · {st.totalLatePeriods} Х
                          </span>
                          {log.verifiedByAdmin && (
                            <span className="text-blue-700 font-sans font-semibold">Баталгаажсан</span>
                          )}
                        </div>

                        {log.dayNotes && (
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            {log.dayNotes}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Day Full Record Inspector */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Day Header */}
            <div className="p-5 border-b border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-blue-700">{selectedHistoryDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-700">{selectedDayStats.weekday} гараг</span>
                    <span aria-hidden="true">·</span>
                    {isSelectedDateSaved ? (
                      <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Түүхэнд хадгалагдсан
                        {selectedLog.savedAt ? ` (${selectedLog.savedAt})` : ''}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Түүхэнд хараахан хадгалаагүй өдөр</span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedHistoryDate}-ны өдрийн бүрэн бүртгэл
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isSelectedDateSaved && isAdmin ? (
                    <button
                      onClick={() => onSaveDayToHistory(selectedHistoryDate)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      Энэ өдрийг түүхэнд хадгалах
                    </button>
                  ) : null}

                  {isAdmin && (
                    <button
                      onClick={() => onSelectDateToEdit(selectedHistoryDate)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Ирц засах
                    </button>
                  )}

                  <button
                    onClick={() => onOpenReportForDate(selectedHistoryDate)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Журнал
                  </button>

                  <button
                    onClick={() =>
                      exportDailyAttendanceCSV(selectedHistoryDate, students, selectedLog, config)
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>

                  {isAdmin && isSelectedDateSaved && (
                    confirmDeleteDate === selectedHistoryDate ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1">
                        <span className="text-[11px] font-bold text-rose-800">Устгах уу?</span>
                        <button
                          onClick={() => {
                            onDeleteDayHistory(selectedHistoryDate);
                            setConfirmDeleteDate(null);
                            const remaining = sortedSavedDates.filter((d) => d !== selectedHistoryDate);
                            if (remaining.length > 0) {
                              setSelectedHistoryDate(remaining[0]);
                            }
                          }}
                          className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
                        >
                          Тийм
                        </button>
                        <button
                          onClick={() => setConfirmDeleteDate(null)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-white rounded-md transition-colors"
                        >
                          Болих
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteDate(selectedHistoryDate)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Энэ өдрийн түүхийг устгах"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Day Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Өдрийн ирц</span>
                  <span className="text-base font-bold font-mono tabular-nums text-blue-700">
                    {selectedDayStats.attendancePct}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Бүтэн ирсэн</span>
                  <span className="text-base font-bold font-mono tabular-nums text-emerald-700">
                    {selectedDayStats.fullyPresent} / {students.length}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Хоцорсон цаг</span>
                  <span className="text-base font-bold font-mono tabular-nums text-amber-700">
                    {selectedDayStats.totalLatePeriods}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Тасалсан цаг</span>
                  <span className="text-base font-bold font-mono tabular-nums text-rose-700">
                    {selectedDayStats.totalAbsentPeriods}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Дүрэмт хувцас</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {selectedDayStats.uniformPct}%
                  </span>
                </div>
              </div>

              {/* Period-by-period mini breakdown */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px]">
                {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                  const pc = selectedDayStats.periodCounts[pNum];
                  return (
                    <div
                      key={pNum}
                      className="p-2 rounded-xl bg-blue-50/50 border border-blue-100"
                    >
                      <div className="font-bold text-blue-900">{pNum}-р цаг</div>
                      <div className="font-mono tabular-nums text-emerald-700 font-bold mt-0.5">
                        {pc.p + pc.e} И
                      </div>
                      {(pc.a > 0 || pc.l > 0) && (
                        <div className="font-mono tabular-nums text-[10px] text-slate-600">
                          {pc.a > 0 ? `${pc.a}Т ` : ''}
                          {pc.l > 0 ? `${pc.l}Х` : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Daily General Note (Editable by Admin) */}
              <form onSubmit={handleSaveDayNote} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Өдрийн ерөнхий тэмдэглэл & Түүхийн тайлбар
                  </label>
                  {noteSavedToast && (
                    <span className="text-xs font-semibold text-emerald-700">
                      Тэмдэглэл хадгалагдлаа
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={dayNoteDraft}
                    onChange={(e) => setDayNoteDraft(e.target.value)}
                    placeholder={
                      isAdmin
                        ? 'Энэ өдрийн онцлох үйл явдал, ирцийн тайлбар бичих...'
                        : 'Өдрийн тэмдэглэл оруулаагүй байна'
                    }
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-80"
                  />
                  {isAdmin && (
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Тэмдэглэл хадгалах
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Search & Filter Toolbar for the Selected Day */}
            <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Сурагч хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
                {(
                  [
                    { key: 'all', label: `Бүгд (${students.length})` },
                    { key: 'absent', label: 'Тасалсан' },
                    { key: 'late', label: 'Хоцорсон' },
                    { key: 'excused', label: 'Чөлөөтэй' },
                    { key: 'uniform', label: 'Хувцасны зөрчил' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setDayFilter(item.key)}
                    className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                      dayFilter === item.key
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 34-Student Attendance Table for the Selected Historical Day */}
            <div className="overflow-x-auto max-h-[540px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-blue-700 text-white sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">№</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Сурагчийн нэр</th>
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <th key={p} className="py-2.5 px-1.5 text-center w-9 font-mono">
                        {p}-р
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center min-w-[85px]">Хувцас</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Тэмдэглэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDayStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-slate-500">
                        Энэ шүүлтүүрт тохирох сурагч алга.
                      </td>
                    </tr>
                  ) : (
                    filteredDayStudents.map((stu) => {
                      const rec = selectedLog.records[stu.id];
                      const pMap = rec?.periods || {
                        1: 'present',
                        2: 'present',
                        3: 'present',
                        4: 'present',
                        5: 'present',
                        6: 'present',
                        7: 'present',
                      };
                      const u = rec?.uniform || { status: 'compliant' };

                      return (
                        <tr key={stu.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-500 tabular-nums">
                            {stu.rollNumber}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => onSelectStudent(stu, selectedHistoryDate)}
                              className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors"
                            >
                              {stu.lastName} {stu.firstName}
                            </button>
                          </td>
                          {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                            const st = pMap[pNum] || 'present';
                            const badge = getPeriodBadge(st);
                            return (
                              <td key={pNum} className="py-1.5 px-1 text-center">
                                <span
                                  className={`inline-flex w-7 h-6 items-center justify-center rounded border font-mono text-[11px] ${badge.cls}`}
                                >
                                  {badge.text}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-2 px-3 text-center text-[11px] font-semibold">
                            {u.status === 'compliant' && <span className="text-emerald-700">Бүрэн</span>}
                            {u.status === 'partial' && <span className="text-amber-700">Дутуу</span>}
                            {u.status === 'non_compliant' && <span className="text-rose-700">Зөрчил</span>}
                            {u.status === 'exempt' && <span className="text-blue-700">Чөлөө</span>}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-600 max-w-[200px] truncate">
                            {rec?.dailyRemark || (u.violationReason ? `Хувцас: ${u.violationReason}` : '—')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BY STUDENT (MULTI-DAY CUMULATIVE REPORT) */}
      {viewMode === 'by_student' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Сурагчийн нэр, дугаараар хайх..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setStudentSort('roll')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  studentSort === 'roll' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                № дарааллаар
              </button>
              <button
                onClick={() => setStudentSort('absent_desc')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  studentSort === 'absent_desc' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Таслалтаар
              </button>
              <button
                onClick={() => setStudentSort('attendance_asc')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  studentSort === 'attendance_asc' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Ирц % өсөхөөр
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">№</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Сурагчийн нэр</th>
                  <th className="py-2.5 px-3 text-right font-mono">Хадгалсан өдөр</th>
                  <th className="py-2.5 px-3 text-right font-mono">Ирсэн (цаг)</th>
                  <th className="py-2.5 px-3 text-right font-mono">Хоцорсон</th>
                  <th className="py-2.5 px-3 text-right font-mono">Тасалсан</th>
                  <th className="py-2.5 px-3 text-right font-mono">Чөлөөтэй</th>
                  <th className="py-2.5 px-3 text-right font-mono">Хувцасны зөрчил</th>
                  <th className="py-2.5 px-3 text-right font-mono">Нийт ирц %</th>
                  <th className="py-2.5 px-3 text-center">Дэлгэрэнгүй</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentCumulativeRows.map((row) => {
                  const isExpanded = expandedStudentId === row.student.id;
                  return (
                    <React.Fragment key={row.student.id}>
                      <tr className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500 tabular-nums">
                          {row.student.rollNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => onSelectStudent(row.student)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left"
                          >
                            {row.student.lastName} {row.student.firstName}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                          {row.totalDays} өдөр
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                          {row.presentPeriods}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-amber-700">
                          {row.latePeriods}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-rose-700">
                          {row.absentPeriods}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-blue-700">
                          {row.excusedPeriods}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {row.uniformViolationDays} өдөр
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-extrabold">
                          <span
                            className={
                              row.attendancePct >= 95
                                ? 'text-emerald-700'
                                : row.attendancePct >= 85
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {row.attendancePct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() =>
                              setExpandedStudentId(isExpanded ? null : row.student.id)
                            }
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                          >
                            {isExpanded ? 'Хураах' : 'Өдрүүд харах'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={10} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900">
                                  {row.student.lastName} {row.student.firstName} — Өдөр бүрийн ирцийн түүх
                                </span>
                                <span className="text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Нийт {sortedSavedDates.length} өдөр
                                </span>
                              </div>

                              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden">
                                {sortedSavedDates.map((d) => {
                                  const rec = dailyLogs[d]?.records?.[row.student.id];
                                  const pMap = rec?.periods || {
                                    1: 'present',
                                    2: 'present',
                                    3: 'present',
                                    4: 'present',
                                    5: 'present',
                                    6: 'present',
                                    7: 'present',
                                  };
                                  const u = rec?.uniform || { status: 'compliant' };
                                  return (
                                    <div
                                      key={d}
                                      className="px-3.5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-[160px]">
                                        <button
                                          onClick={() => {
                                            setViewMode('by_day');
                                            handleSelectDate(d);
                                          }}
                                          className="font-mono font-bold text-blue-700 hover:underline tabular-nums"
                                        >
                                          {d}
                                        </button>
                                        <span className="text-slate-500">
                                          {getMongolianWeekday(d)}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                                          const badge = getPeriodBadge(pMap[pNum] || 'present');
                                          return (
                                            <span
                                              key={pNum}
                                              className={`w-7 h-6 inline-flex items-center justify-center rounded border font-mono text-[11px] ${badge.cls}`}
                                              title={`${pNum}-р цаг`}
                                            >
                                              {badge.text}
                                            </span>
                                          );
                                        })}
                                      </div>

                                      <div className="flex items-center gap-3 text-[11px]">
                                        <span
                                          className={`font-semibold ${
                                            u.status === 'compliant'
                                              ? 'text-emerald-700'
                                              : u.status === 'exempt'
                                              ? 'text-blue-700'
                                              : 'text-rose-700'
                                          }`}
                                        >
                                          Хувцас:{' '}
                                          {u.status === 'compliant'
                                            ? 'Бүрэн'
                                            : u.status === 'partial'
                                            ? 'Дутуу'
                                            : u.status === 'non_compliant'
                                            ? 'Зөрчил'
                                            : 'Чөлөө'}
                                        </span>
                                        {(rec?.dailyRemark || u.violationReason) && (
                                          <span className="text-slate-500 truncate max-w-[220px]">
                                            {rec?.dailyRemark || u.violationReason}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
