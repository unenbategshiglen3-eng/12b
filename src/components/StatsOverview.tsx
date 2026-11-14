import React, { useState } from 'react';
import { Student, DailyClassLog, ClassroomConfig, UserAccount } from '../types';
import { Calendar, ChevronLeft, ChevronRight, ShieldCheck, History, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { getMongolianWeekday, getTodayDateString, shiftDateString } from '../utils/dateUtils';

interface StatsOverviewProps {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  students: Student[];
  dailyLog: DailyClassLog | undefined;
  isDateSavedInHistory?: boolean;
  savedDaysCount?: number;
  config: ClassroomConfig;
  currentUser: UserAccount;
  onNavigateTab: (tab: any) => void;
  onOpenEditClassInfo?: () => void;
  onSaveDayToHistory?: (date: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  currentDate,
  setCurrentDate,
  students,
  dailyLog,
  isDateSavedInHistory = true,
  savedDaysCount = 0,
  config,
  currentUser,
  onNavigateTab,
  onOpenEditClassInfo,
  onSaveDayToHistory,
}) => {
  const [savedToast, setSavedToast] = useState(false);
  const totalStudents = students.length; // 34
  let fullyPresent = 0;
  let partialPresent = 0;
  let absentWholeDay = 0;

  let uniformCompliant = 0;
  let uniformViolations = 0;
  let uniformExempt = 0;

  const periodAttendanceCounts: Record<number, { present: number; absent: number; late: number; excused: number }> = {
    1: { present: 0, absent: 0, late: 0, excused: 0 },
    2: { present: 0, absent: 0, late: 0, excused: 0 },
    3: { present: 0, absent: 0, late: 0, excused: 0 },
    4: { present: 0, absent: 0, late: 0, excused: 0 },
    5: { present: 0, absent: 0, late: 0, excused: 0 },
    6: { present: 0, absent: 0, late: 0, excused: 0 },
    7: { present: 0, absent: 0, late: 0, excused: 0 },
  };

  students.forEach((stu) => {
    const record = dailyLog?.records[stu.id];
    const periods = record?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };

    let pCount = 0;
    let aCount = 0;
    for (let p = 1; p <= 7; p++) {
      const st = periods[p] || 'present';
      if (st === 'present' || st === 'excused') pCount++;
      if (st === 'absent') aCount++;

      if (periodAttendanceCounts[p]) {
        periodAttendanceCounts[p][st]++;
      }
    }

    if (aCount === 7) absentWholeDay++;
    else if (pCount === 7) fullyPresent++;
    else partialPresent++;

    const uStatus = record?.uniform.status || 'compliant';
    if (uStatus === 'compliant') uniformCompliant++;
    else if (uStatus === 'exempt') uniformExempt++;
    else uniformViolations++;
  });

  const attendancePercentage = totalStudents > 0 ? Math.round(((totalStudents - absentWholeDay) / totalStudents) * 100) : 100;
  const uniformPercentage = totalStudents > 0 ? Math.round(((uniformCompliant + uniformExempt) / totalStudents) * 100) : 100;

  const shiftDate = (offsetDays: number) => {
    setCurrentDate(shiftDateString(currentDate, offsetDays));
  };

  const weekdayName = getMongolianWeekday(currentDate);
  const isAdmin = currentUser.role === 'admin';

  const handleSaveCurrentDay = () => {
    if (!onSaveDayToHistory) return;
    onSaveDayToHistory(currentDate);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-4 no-print">
      {/* Blue Highlight Header strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <span>{config.schoolName}</span>
            <span aria-hidden="true">·</span>
            <span>{config.className}</span>
            <span aria-hidden="true">·</span>
            <span>{config.adminName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalStudents} сурагчтай</span>
            {isAdmin && onOpenEditClassInfo && (
              <button
                onClick={onOpenEditClassInfo}
                className="ml-2 px-2 py-0.5 text-[11px] text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-md font-bold transition-colors"
              >
                Анги засах
              </button>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <span>Ангийн ирц, дүрэмт хувцасны хяналт</span>
          </h1>
        </div>

        {/* Date Selector with Blue Accents */}
        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-xl p-1 shadow-xs">
          <button
            onClick={() => shiftDate(-1)}
            aria-label="Өмнөх өдөр"
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-blue-950">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
              className="font-mono text-xs text-slate-800 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
            />
            {weekdayName && (
              <span className="text-[11px] text-blue-700 font-semibold hidden sm:inline">
                ({weekdayName})
              </span>
            )}
          </div>
          <button
            onClick={() => shiftDate(1)}
            aria-label="Дараагийн өдөр"
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(getTodayDateString())}
            className="ml-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
          >
            Өнөөдөр
          </button>
        </div>
      </div>

      {/* History Save & Administrator Privilege Bar */}
      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {isAdmin ? (
              <span>
                <strong className="font-bold text-blue-800">{currentDate} ({weekdayName})</strong>:{' '}
                {savedToast ? (
                  <span className="text-emerald-700 font-bold">Түүхэнд амжилттай хадгалагдлаа!</span>
                ) : isDateSavedInHistory ? (
                  <span>Энэ өдрийн бүртгэл түүхэнд хадгалагдсан байна{dailyLog?.savedAt ? ` (${dailyLog.savedAt})` : ''}.</span>
                ) : (
                  <span className="text-amber-800 font-semibold">Шинэ өдөр — ирц, хувцас тэмдэглэхэд түүхэнд автоматаар хадгалагдана.</span>
                )}
              </span>
            ) : (
              <span>Та сурагчийн эрхээр нэвтэрсэн байна (Зөвхөн харах эрхтэй).</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && onSaveDayToHistory && (
            <button
              onClick={handleSaveCurrentDay}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isDateSavedInHistory
                  ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
              }`}
            >
              {isDateSavedInHistory ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Түүх шинэчлэх
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  Түүхэнд хадгалах
                </>
              )}
            </button>
          )}
          <button
            onClick={() => onNavigateTab('history')}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <History className="w-3.5 h-3.5" />
            Өдрийн түүх ({savedDaysCount})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Daily Attendance */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 cursor-pointer transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-blue-900">Өдрийн нийт ирц</span>
            <span className="font-mono tabular-nums text-blue-700 font-bold">{attendancePercentage}%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalStudents - absentWholeDay}
              <span className="text-sm font-normal text-slate-500 font-sans"> / {totalStudents}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {absentWholeDay === 0 ? 'Бүрэн ирсэн' : `${absentWholeDay} тасалсан`}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-mono tabular-nums text-slate-700">{fullyPresent} бүрэн</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-amber-700">{partialPresent} хэсэгчлэн</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-rose-700">{absentWholeDay} тасалсан</span>
          </div>
        </div>

        {/* Metric 2: 7 Class Periods */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 cursor-pointer transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-blue-900">7 цагийн хуваарилалт</span>
            <span className="font-mono tabular-nums text-blue-600 font-bold">1-7-р цаг</span>
          </div>
          <div className="flex items-end gap-1.5 h-8 mt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
              const pData = periodAttendanceCounts[pNum];
              const presentTotal = pData.present + pData.excused;
              const heightPct = Math.round((presentTotal / totalStudents) * 100);
              const isLower = heightPct < 90;
              return (
                <div key={pNum} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-xs transition-all ${
                      isLower ? 'bg-amber-400' : 'bg-blue-600'
                    }`}
                    style={{ height: `${Math.max(20, heightPct * 0.28)}px` }}
                    title={`${pNum}-р цаг: ${presentTotal}/${totalStudents} ирсэн`}
                  />
                  <span className="text-[10px] font-mono tabular-nums text-slate-500">{pNum}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>7 цагийн matrix харах</span>
            <span className="text-blue-600 group-hover:underline text-[11px] font-semibold">&rarr;</span>
          </div>
        </div>

        {/* Metric 3: Uniform Compliance */}
        <div
          onClick={() => onNavigateTab('uniform')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 cursor-pointer transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-blue-900">Дүрэмт хувцасны үзлэг</span>
            <span className="font-mono tabular-nums text-blue-700 font-bold">{uniformPercentage}%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {uniformCompliant}
              <span className="text-sm font-normal text-slate-500 font-sans"> / {totalStudents}</span>
            </div>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
              uniformViolations > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {uniformViolations > 0 ? `${uniformViolations} зөрчил` : '100% бүрэн'}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-mono tabular-nums text-emerald-700">{uniformCompliant} бүрэн</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-amber-700">{uniformViolations} дутуу</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-600">{uniformExempt} чөлөө</span>
          </div>
        </div>
      </div>
    </div>
  );
};
