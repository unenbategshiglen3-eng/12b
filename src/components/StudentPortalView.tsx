import React, { useState, useMemo } from 'react';
import { Student, DailyClassLog, ClassroomConfig, WeekdayName, PeriodInfo } from '../types';
import { WEEKDAYS } from '../data/mockStudents';
import { getMongolianWeekday } from '../utils/dateUtils';
import { CheckCircle2, Shirt, Phone, Send, ShieldAlert, Check, Download, History } from 'lucide-react';

interface StudentPortalViewProps {
  student: Student;
  dailyLog: DailyClassLog;
  dailyLogs?: Record<string, DailyClassLog>;
  config: ClassroomConfig;
  currentDate: string;
  onSendStudentNote: (studentId: string, noteText: string) => void;
  onUpdateParentPhone: (studentId: string, fatherPhone: string, motherPhone: string) => void;
  onOpenDownloadModal: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student,
  dailyLog,
  dailyLogs = {},
  config,
  currentDate,
  onSendStudentNote,
  onUpdateParentPhone,
  onOpenDownloadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'history' | 'schedule' | 'phone'>('attendance');
  const [requestText, setRequestText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Parent Phone State
  const [fatherPhone, setFatherPhone] = useState(student.fatherPhone || student.guardianPhone || '');
  const [motherPhone, setMotherPhone] = useState(student.motherPhone || '');
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Weekly schedule day
  const [selectedDay, setSelectedDay] = useState<WeekdayName>('Даваа');

  const todayPeriods: PeriodInfo[] = useMemo(() => {
    const weekday = getMongolianWeekday(currentDate) as WeekdayName;
    if (config.weeklyTimetable && config.weeklyTimetable[weekday]?.length > 0) {
      return config.weeklyTimetable[weekday];
    }
    return config.periods || [];
  }, [currentDate, config]);

  const studentDaily = dailyLog.records[student.id];
  const pMap = studentDaily?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };
  const uniform = studentDaily?.uniform || { status: 'compliant' };

  let presentCount = 0;
  for (let i = 1; i <= 7; i++) {
    if (pMap[i] === 'present' || pMap[i] === 'excused') presentCount++;
  }

  const savedDates = useMemo(
    () => Object.keys(dailyLogs).sort((a, b) => b.localeCompare(a)),
    [dailyLogs]
  );

  const studentHistorySummary = useMemo(() => {
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalExcused = 0;
    savedDates.forEach((d) => {
      const rec = dailyLogs[d]?.records?.[student.id];
      const periods = rec?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };
      for (let p = 1; p <= 7; p++) {
        const st = periods[p] || 'present';
        if (st === 'present') totalPresent++;
        else if (st === 'late') totalLate++;
        else if (st === 'absent') totalAbsent++;
        else if (st === 'excused') totalExcused++;
      }
    });
    const totalPeriods = savedDates.length * 7;
    const pct = totalPeriods > 0 ? Math.round(((totalPresent + totalExcused + totalLate * 0.8) / totalPeriods) * 100) : 100;
    return { totalPresent, totalLate, totalAbsent, totalExcused, pct };
  }, [savedDates, dailyLogs, student.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) return;

    onSendStudentNote(student.id, requestText.trim());
    setRequestText('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateParentPhone(student.id, fatherPhone.trim(), motherPhone.trim());
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 3000);
  };

  const getStatusDisplay = (s: string) => {
    switch (s) {
      case 'present':
        return { text: 'Ирсэн', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'late':
        return { text: 'Хоцорсон', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'absent':
        return { text: 'Тасалсан', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'excused':
        return { text: 'Чөлөөтэй', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      default:
        return { text: 'Ирсэн', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Banner */}
      <div className="bg-linear-to-r from-blue-700 via-blue-800 to-blue-900 text-white rounded-3xl p-6 shadow-md border border-blue-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-blue-900 flex flex-col items-center justify-center font-black text-xl font-mono shadow-md">
              <span className="text-[10px] uppercase font-sans text-blue-600 font-bold">№</span>
              <span>{student.rollNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/40 text-blue-100 text-xs font-bold">
                  Сурагч & Эцэг эхийн булан
                </span>
                <span className="font-mono text-xs text-blue-200">
                  {student.id}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">
                {student.lastName} {student.firstName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-blue-100 mt-1">
                <span>{config.schoolName}</span>
                <span aria-hidden="true">·</span>
                <span>{config.className}</span>
                <span aria-hidden="true">·</span>
                <span>Багш: {config.adminName}</span>
              </div>
            </div>
          </div>

          {/* Quick app download button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDownloadModal}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Апп суулгах (PWA)</span>
            </button>
          </div>
        </div>

        {/* Read-Only Blue Notice */}
        <div className="mt-4 pt-3 border-t border-blue-500/40 flex items-center gap-2 text-xs text-blue-100">
          <ShieldAlert className="w-4 h-4 text-blue-300 shrink-0" />
          <span>
            <strong>Мэдэгдэл:</strong> 7 цагийн ирц болон дүрэмт хувцасны мэдээллийг зөвхөн Ангийн багш ({config.adminName || 'Администратор'}) албан ёсоор засах эрхтэй.
          </span>
        </div>

        {/* Portal Nav Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-blue-600/70 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'attendance' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            Өнөөдрийн 7 цагийн ирц
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Миний ирцийн түүх ({savedDates.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'schedule' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            5 өдрийн хуваарь
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'phone' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Өөрийн дугаар бүртгэх
          </button>
        </div>
      </div>

      {/* TAB 1: ATTENDANCE & UNIFORM TODAY */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Өдрийн ирцийн бүртгэл
                </div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Өнөөдрийн 7 цагийн ирц
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono font-bold">
                Огноо: {currentDate} ({presentCount}/7 Ирсэн)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayPeriods.map((period) => {
                const status = pMap[period.periodNumber] || 'present';
                const disp = getStatusDisplay(status);

                return (
                  <div
                    key={period.periodNumber}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] font-black flex items-center justify-center font-mono">
                          {period.periodNumber}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs">
                          {period.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {period.timeSlot} · {period.room}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Багш: {period.teacher}
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-xl border text-xs font-bold font-mono ${disp.color}`}>
                      {disp.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Uniform Inspection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Өглөөний шалгалт
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Дүрэмт хувцасны үзлэг
              </h2>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Shirt className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Өнөөдрийн байдал:</span>
                <span className={`text-base font-extrabold block ${
                  uniform.status === 'compliant' ? 'text-emerald-700' :
                  uniform.status === 'partial' ? 'text-amber-700' :
                  uniform.status === 'non_compliant' ? 'text-rose-700' : 'text-blue-700'
                }`}>
                  {uniform.status === 'compliant' && 'Бүрэн дүрэмт хувцастай'}
                  {uniform.status === 'partial' && 'Дүрэмт хувцас дутуу'}
                  {uniform.status === 'non_compliant' && 'Дүрэмт хувцасны зөрчилтэй'}
                  {uniform.status === 'exempt' && 'Чөлөөлөгдсөн (Эмчийн чөлөөтэй)'}
                </span>
              </div>
              {uniform.violationReason && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs text-left">
                  <strong>Багшийн тэмдэглэл:</strong> {uniform.violationReason}
                </div>
              )}
            </div>

            {/* Leave Request form */}
            <div className="pt-2">
              <h3 className="font-bold text-slate-800 text-xs mb-2">
                Ангийн багшид чөлөө хүсэх / Зурвас илгээх:
              </h3>
              {sentSuccess && (
                <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Хүсэлт багшид амжилттай хүргэгдлээ!
                </div>
              )}
              <form onSubmit={handleSendMessage} className="space-y-2 text-xs">
                <textarea
                  rows={3}
                  required
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="Жишээ: Маргааш эмчид үзүүлэх тул 3-р цагт чөлөө олгоно уу..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Багшид илгээх
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1B: MY DAILY ATTENDANCE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Өдөр бүрийн түүх
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Миний ирц ба дүрэмт хувцасны түүх ({savedDates.length} өдөр)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
              <span className="text-blue-700 font-bold">Нийт ирц: {studentHistorySummary.pct}%</span>
              <span className="text-emerald-700 font-bold">{studentHistorySummary.totalPresent} И</span>
              <span className="text-amber-700 font-bold">{studentHistorySummary.totalLate} Х</span>
              <span className="text-rose-700 font-bold">{studentHistorySummary.totalAbsent} Т</span>
              <span className="text-blue-600 font-bold">{studentHistorySummary.totalExcused} Ч</span>
            </div>
          </div>

          {savedDates.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Одоогоор хадгалагдсан өдрийн түүх алга байна.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {savedDates.map((d) => {
                const log = dailyLogs[d];
                const rec = log?.records?.[student.id];
                const dayPeriods = rec?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };
                const dayUniform = rec?.uniform || { status: 'compliant' };

                return (
                  <div key={d} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70">
                    <div className="space-y-0.5 min-w-[170px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">{d}</span>
                        <span className="text-xs text-slate-500">{getMongolianWeekday(d)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Дүрэмт хувцас:{' '}
                        <span
                          className={`font-bold ${
                            dayUniform.status === 'compliant'
                              ? 'text-emerald-700'
                              : dayUniform.status === 'exempt'
                              ? 'text-blue-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {dayUniform.status === 'compliant'
                            ? 'Бүрэн'
                            : dayUniform.status === 'partial'
                            ? 'Дутуу'
                            : dayUniform.status === 'non_compliant'
                            ? 'Зөрчилтэй'
                            : 'Чөлөөтэй'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                        const st = dayPeriods[pNum] || 'present';
                        const letter = st === 'present' ? 'И' : st === 'late' ? 'Х' : st === 'absent' ? 'Т' : 'Ч';
                        const cls =
                          st === 'present'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : st === 'late'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : st === 'absent'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200';
                        return (
                          <div
                            key={pNum}
                            className={`px-2 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1 ${cls}`}
                          >
                            <span className="text-[10px] opacity-70">{pNum}:</span>
                            <span>{letter}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs text-slate-600 md:text-right max-w-[240px] truncate">
                      {rec?.dailyRemark || dayUniform.violationReason || log?.dayNotes || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 5-DAY WEEKLY SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Хичээлийн хуваарь
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                12Б ангийн 5 өдрийн хуваарь (Даваа - Баасан)
              </h2>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {WEEKDAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedDay === d ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(config.weeklyTimetable[selectedDay] || []).map((p) => (
              <div
                key={p.periodNumber}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center font-mono">
                      {p.periodNumber}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      {p.subject}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {p.timeSlot} · {p.room}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Багш: {p.teacher}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PARENT PHONE NUMBERS */}
      {activeTab === 'phone' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="pb-3 border-b border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Холбоо барих мэдээлэл
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              <span>Өөрийн дугаар бүртгэх / шинэчлэх</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Сургууль, ангийн багшаас ирцийн болон ангийн мэдээллийг шуурхай авах өөрийн гар утасны дугаарыг энд оруулна уу.
            </p>
          </div>

          {phoneSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Өөрийн дугаар амжилттай шинэчлэгдэж хадгалагдлаа!
            </div>
          )}

          <form onSubmit={handleSavePhone} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Өөрийн дугаар:
              </label>
              <input
                type="text"
                required
                value={fatherPhone}
                onChange={(e) => setFatherPhone(e.target.value)}
                placeholder="Өөрийн утасны дугаараа оруулна уу"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Нөөц дугаар (Сонголттой):
              </label>
              <input
                type="text"
                value={motherPhone}
                onChange={(e) => setMotherPhone(e.target.value)}
                placeholder="Нөөц утасны дугаар"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-relaxed">
              <strong>Асран хамгаалагч:</strong> {student.guardianName} ({student.guardianRelation})<br />
              <strong>Гэрийн хаяг:</strong> {student.address}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Өөрийн дугаар хадгалах
            </button>
          </form>
        </div>
      )}


    </div>
  );
};
