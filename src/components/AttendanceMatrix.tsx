import React, { useState } from 'react';
import { Student, AttendanceStatus, DailyClassLog, PeriodInfo } from '../types';
import { Search, Check, Clock, X, ShieldAlert, CheckCheck, ArrowUpDown, Lock } from 'lucide-react';

interface AttendanceMatrixProps {
  students: Student[];
  dailyLog: DailyClassLog;
  periods: PeriodInfo[];
  isAdmin: boolean;
  onUpdateAttendance: (studentId: string, periodNumber: number, status: AttendanceStatus) => void;
  onBulkUpdatePeriod: (periodNumber: number, status: AttendanceStatus) => void;
  onBulkUpdateStudent: (studentId: string, status: AttendanceStatus) => void;
  onBulkUpdateAll: (status: AttendanceStatus) => void;
  onSelectStudent: (student: Student) => void;
  onUpdateDailyRemark: (studentId: string, remark: string) => void;
}

export const AttendanceMatrix: React.FC<AttendanceMatrixProps> = ({
  students,
  dailyLog,
  periods,
  isAdmin,
  onUpdateAttendance,
  onBulkUpdatePeriod,
  onBulkUpdateStudent,
  onBulkUpdateAll,
  onSelectStudent,
  onUpdateDailyRemark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'absent' | 'late' | 'uniform_violation'>('all');
  const [sortField, setSortField] = useState<'roll' | 'name'>('roll');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeRemarkStudentId, setActiveRemarkStudentId] = useState<string | null>(null);
  const [remarkDraft, setRemarkDraft] = useState('');

  // Status cycling order
  const STATUS_CYCLE: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

  const cycleStatus = (currentStatus: AttendanceStatus): AttendanceStatus => {
    const idx = STATUS_CYCLE.indexOf(currentStatus);
    return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  };

  // Mongolian status letters and styles
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return {
          label: 'И',
          name: 'Ирсэн',
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
        };
      case 'late':
        return {
          label: 'Х',
          name: 'Хоцорсон',
          classes: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 font-bold',
        };
      case 'absent':
        return {
          label: 'Т',
          name: 'Тасалсан',
          classes: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 font-bold',
        };
      case 'excused':
        return {
          label: 'Ч',
          name: 'Чөлөөтэй',
          classes: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100 font-bold',
        };
    }
  };

  const filteredStudents = students
    .filter((stu) => {
      const fullName = `${stu.lastName} ${stu.firstName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        stu.rollNumber.toString() === searchQuery.trim() ||
        stu.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const record = dailyLog.records[stu.id];
      const pStatuses = record?.periods || {};

      if (filterType === 'absent') {
        return Object.values(pStatuses).some((s) => s === 'absent');
      }
      if (filterType === 'late') {
        return Object.values(pStatuses).some((s) => s === 'late');
      }
      if (filterType === 'uniform_violation') {
        return record?.uniform.status === 'non_compliant' || record?.uniform.status === 'partial';
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'roll') {
        return sortAsc ? a.rollNumber - b.rollNumber : b.rollNumber - a.rollNumber;
      } else {
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
    });

  const periodStats = periods.map((period) => {
    let p = 0;
    let a = 0;
    let l = 0;
    let e = 0;
    students.forEach((stu) => {
      const st = dailyLog.records[stu.id]?.periods[period.periodNumber] || 'present';
      if (st === 'present') p++;
      else if (st === 'absent') a++;
      else if (st === 'late') l++;
      else if (st === 'excused') e++;
    });
    return { p, a, l, e, total: students.length };
  });

  const handleSaveRemark = (studentId: string) => {
    if (!isAdmin) return;
    onUpdateDailyRemark(studentId, remarkDraft);
    setActiveRemarkStudentId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Action Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`${students.length} сурагчаас нэр, дугаараар хайх...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Бүгд ({students.length})
            </button>
            <button
              onClick={() => setFilterType('absent')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'absent'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Тасалсан
            </button>
            <button
              onClick={() => setFilterType('late')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'late'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-amber-600'
              }`}
            >
              Хоцорсон
            </button>
            <button
              onClick={() => setFilterType('uniform_violation')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'uniform_violation'
                  ? 'bg-blue-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-blue-800'
              }`}
            >
              Хувцасны зөрчил
            </button>
          </div>
        </div>

        {/* Right: Administrative Bulk Actions */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => onBulkUpdateAll('present')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              title={`${students.length} сурагчийг бүтэн өдрөөр нь 'Ирсэн' гэж тэмдэглэх`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Бүгдийг ирснээр тэмдэглэх (7 цаг)
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Зөвхөн админ ирц өөрчлөх эрхтэй</span>
            </div>
          )}

          <button
            onClick={() => {
              setSortField('roll');
              setSortAsc(!sortAsc);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Эрэмбэ: № {sortAsc ? `1-${students.length}` : `${students.length}-1`}
          </button>
        </div>
      </div>

      {/* Legend & Instructions Bar */}
      <div className="px-4 py-2.5 bg-blue-50/50 border-b border-blue-100 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-blue-900">Ирцийн тэмдэглэгээ:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono text-[10px]">И</span>
            <span>Ирсэн</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-amber-100 text-amber-800 font-bold flex items-center justify-center font-mono text-[10px]">Х</span>
            <span>Хоцорсон</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-rose-100 text-rose-800 font-bold flex items-center justify-center font-mono text-[10px]">Т</span>
            <span>Тасалсан</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center font-mono text-[10px]">Ч</span>
            <span>Чөлөөтэй</span>
          </span>
        </div>
        <div className="text-[11px] text-blue-800 font-medium">
          {isAdmin ? 'Нүдэн дээр дарж ирцийг солино уу (И ➔ Х ➔ Т ➔ Ч) · Бүх өөрчлөлт өдрийн түүхэнд хадгалагдана' : 'Сурагчид өөрийн мэдээллээ хянаж харах боломжтой'}
        </div>
      </div>

      {/* 7-Period Interactive Matrix Table with Blue Highlight Headers */}
      <div className="overflow-x-auto max-h-[640px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-blue-700 sticky top-0 z-20 text-white border-b border-blue-800">
            <tr>
              <th className="py-2.5 px-3 font-bold w-12 text-center border-r border-blue-600/70 sticky left-0 bg-blue-700 z-30">
                №
              </th>
              <th className="py-2.5 px-3 font-bold min-w-[190px] border-r border-blue-600/70 sticky left-12 bg-blue-700 z-30">
                Сурагчийн нэр
              </th>

              {/* 7 Daily Periods highlighted in Blue */}
              {periods.map((period) => (
                <th
                  key={period.periodNumber}
                  className="py-2 px-2 text-center border-r border-blue-600/70 min-w-[78px]"
                >
                  <div className="font-extrabold text-white">{period.periodNumber}-р цаг</div>
                  <div className="text-[10px] text-blue-100 font-normal truncate max-w-[76px]">
                    {period.subject}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => onBulkUpdatePeriod(period.periodNumber, 'present')}
                      className="mt-1 text-[10px] text-blue-200 hover:text-white hover:underline block mx-auto whitespace-nowrap font-medium"
                      title={`${period.periodNumber}-р цагт бүгдийг Ирснээр тэмдэглэх`}
                    >
                      Бүгд И
                    </button>
                  )}
                </th>
              ))}

              <th className="py-2.5 px-3 font-bold text-center border-r border-blue-600/70 min-w-[95px]">
                Дүрэмт хувцас
              </th>
              <th className="py-2.5 px-3 font-bold min-w-[170px]">
                Багшийн тэмдэглэл
              </th>
              {isAdmin && (
                <th className="py-2.5 px-2 text-center w-16">
                  Хурдан
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 12 : 11} className="py-12 text-center text-slate-500">
                  Хайлтад тохирох сурагч олдсонгүй.
                </td>
              </tr>
            ) : (
              filteredStudents.map((stu) => {
                const record = dailyLog.records[stu.id];
                const periodsMap = record?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };
                const uniform = record?.uniform || { status: 'compliant' };

                let hasAbsence = false;
                for (let i = 1; i <= 7; i++) {
                  if (periodsMap[i] === 'absent') hasAbsence = true;
                }

                return (
                  <tr
                    key={stu.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      hasAbsence ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Roll Number */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500 border-r border-slate-200/60 sticky left-0 bg-white z-10 tabular-nums">
                      {stu.rollNumber}
                    </td>

                    {/* Student Name */}
                    <td className="py-2.5 px-3 border-r border-slate-200/60 sticky left-12 bg-white z-10">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectStudent(stu)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left truncate transition-colors"
                        >
                          {stu.lastName} {stu.firstName}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400 tabular-nums shrink-0">
                          {stu.id}
                        </span>
                      </div>
                    </td>

                    {/* 7 Daily Periods */}
                    {periods.map((period) => {
                      const status = periodsMap[period.periodNumber] || 'present';
                      const badge = getStatusBadge(status);

                      return (
                        <td
                          key={period.periodNumber}
                          className="py-1 px-1 text-center border-r border-slate-200/60"
                        >
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() =>
                              isAdmin &&
                              onUpdateAttendance(
                                stu.id,
                                period.periodNumber,
                                cycleStatus(status)
                              )
                            }
                            className={`w-9 h-8 mx-auto rounded-lg border text-xs font-extrabold font-mono transition-all flex items-center justify-center select-none ${
                              isAdmin ? 'cursor-pointer active:scale-95' : 'cursor-default opacity-90'
                            } ${badge.classes}`}
                            title={`${period.periodNumber}-р цаг (${period.subject}): ${badge.name}. ${
                              isAdmin ? 'Дарахад солигдоно.' : 'Зөвхөн админ засна.'
                            }`}
                          >
                            {badge.label}
                          </button>
                        </td>
                      );
                    })}

                    {/* Uniform Status Column */}
                    <td className="py-2 px-2 text-center border-r border-slate-200/60">
                      {uniform.status === 'compliant' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Check className="w-3.5 h-3.5" />
                          <span>Бүрэн</span>
                        </span>
                      )}
                      {uniform.status === 'non_compliant' && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700"
                          title={uniform.violationReason || 'Дүрэмт хувцас дутуу'}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Зөрчил</span>
                        </span>
                      )}
                      {uniform.status === 'partial' && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700"
                          title={uniform.violationReason || 'Дутуу'}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Дутуу</span>
                        </span>
                      )}
                      {uniform.status === 'exempt' && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700"
                          title={uniform.violationReason || 'Чөлөөтэй'}
                        >
                          <span>Чөлөө</span>
                        </span>
                      )}
                    </td>

                    {/* Daily Admin Remark */}
                    <td className="py-2 px-3 border-r border-slate-200/60">
                      {isAdmin && activeRemarkStudentId === stu.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRemark(stu.id)}
                            placeholder="Тэмдэглэл бичих..."
                            className="w-full text-xs px-2 py-1 bg-white border border-blue-500 rounded focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRemark(stu.id)}
                            className="px-2 py-1 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700 font-bold shrink-0"
                          >
                            Хадгалах
                          </button>
                          <button
                            onClick={() => setActiveRemarkStudentId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 px-1"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (isAdmin) {
                              setActiveRemarkStudentId(stu.id);
                              setRemarkDraft(record?.dailyRemark || '');
                            }
                          }}
                          className={`text-xs truncate py-0.5 ${
                            isAdmin ? 'cursor-pointer hover:text-blue-600' : 'cursor-default'
                          }`}
                          title={record?.dailyRemark || (isAdmin ? 'Тэмдэглэл нэмэх' : '')}
                        >
                          <span className={record?.dailyRemark ? 'text-slate-800' : 'text-slate-400 italic'}>
                            {record?.dailyRemark || (isAdmin ? '+ Тэмдэглэл бичих' : '—')}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Fast Row Action (Admin only) */}
                    {isAdmin && (
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => onBulkUpdateStudent(stu.id, 'present')}
                          className="px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          title="Энэ сурагчийг 7 цаг бүгдэд нь 'Ирсэн' гэж тэмдэглэх"
                        >
                          Бүгд И
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer */}
          <tfoot className="bg-blue-50/60 font-semibold text-slate-800 border-t-2 border-blue-200">
            <tr>
              <td colSpan={2} className="py-2.5 px-3 text-xs font-bold text-blue-900 text-right pr-4">
                Цагийн ирцийн нэгтгэл:
              </td>
              {periodStats.map((st, idx) => (
                <td key={idx} className="py-2 px-1 text-center border-r border-blue-200">
                  <div className="font-mono text-xs font-extrabold text-emerald-700 tabular-nums">
                    {st.p} И
                  </div>
                  <div className="text-[10px] font-mono tabular-nums">
                    {st.a > 0 && <span className="text-rose-600 font-bold">{st.a} Т </span>}
                    {st.l > 0 && <span className="text-amber-600 font-bold">{st.l} Х</span>}
                  </div>
                </td>
              ))}
              <td colSpan={isAdmin ? 3 : 2} className="py-2.5 px-3 text-xs text-blue-800 text-right font-bold">
                Нийт {students.length} сурагч
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
