import React, { useState, useEffect } from 'react';
import { ClassroomConfig, WeekdayName, PeriodInfo } from '../types';
import { WEEKDAYS, DEFAULT_WEEKLY_TIMETABLE } from '../data/mockStudents';
import { Calendar, CheckCircle2, Clock, Edit2, RotateCcw, Save, X } from 'lucide-react';

interface WeeklyScheduleViewProps {
  config: ClassroomConfig;
  isAdmin: boolean;
  onUpdateWeeklyTimetable: (timetable: Record<WeekdayName, PeriodInfo[]>) => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  config,
  isAdmin,
  onUpdateWeeklyTimetable,
}) => {
  const [activeDay, setActiveDay] = useState<WeekdayName>('Даваа');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [editingPeriod, setEditingPeriod] = useState<{ day: WeekdayName; periodNumber: number } | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const timetable = config.weeklyTimetable;

  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const handleStartEdit = (day: WeekdayName, period: PeriodInfo) => {
    if (!isAdmin) return;
    setEditingPeriod({ day, periodNumber: period.periodNumber });
    setEditSubject(period.subject);
    setEditTeacher(period.teacher);
    setEditRoom(period.room);
    setEditTimeSlot(period.timeSlot);
  };

  const handleSaveEdit = () => {
    if (!editingPeriod) return;
    const { day, periodNumber } = editingPeriod;
    const dayPeriods = timetable[day] || [];
    const updatedDayPeriods = dayPeriods.map((p) =>
      p.periodNumber === periodNumber
        ? {
            ...p,
            subject: editSubject.trim() || 'Хичээлгүй',
            teacher: editTeacher.trim(),
            room: editRoom.trim(),
            timeSlot: editTimeSlot.trim() || p.timeSlot,
          }
        : p
    );

    const updatedTimetable: Record<WeekdayName, PeriodInfo[]> = {
      ...timetable,
      [day]: updatedDayPeriods,
    };

    onUpdateWeeklyTimetable(updatedTimetable);
    setEditingPeriod(null);
    setSaveMessage(`${day} гарагийн ${periodNumber}-р цагийн хуваарь амжилттай хадгалагдлаа.`);
  };

  const handleResetToDefault = () => {
    if (!isAdmin) return;
    const clonedDefault: Record<WeekdayName, PeriodInfo[]> = {
      Даваа: DEFAULT_WEEKLY_TIMETABLE['Даваа'].map((p) => ({ ...p })),
      Мягмар: DEFAULT_WEEKLY_TIMETABLE['Мягмар'].map((p) => ({ ...p })),
      Лхагва: DEFAULT_WEEKLY_TIMETABLE['Лхагва'].map((p) => ({ ...p })),
      Пүрэв: DEFAULT_WEEKLY_TIMETABLE['Пүрэв'].map((p) => ({ ...p })),
      Баасан: DEFAULT_WEEKLY_TIMETABLE['Баасан'].map((p) => ({ ...p })),
    };
    onUpdateWeeklyTimetable(clonedDefault);
    setEditingPeriod(null);
    setConfirmReset(false);
    setSaveMessage('5 өдрийн үндсэн хуваарь сэргээгдэж хадгалагдлаа.');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingPeriod(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-blue-700 font-semibold">
              <span>{config.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>{config.className}</span>
              <span aria-hidden="true">·</span>
              <span>Багш: {config.adminName}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>5 өдрийн хичээлийн хуваарь (Даваа - Баасан)</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Өөрчлөлт шууд хадгалагдана
              </span>
            )}

            {isAdmin && (
              confirmReset ? (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1 text-xs">
                  <span className="font-bold text-amber-900">Анхны хуваарь сэргээх үү?</span>
                  <button
                    onClick={handleResetToDefault}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                  >
                    Тийм
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold text-[11px]"
                  >
                    Болих
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  title="Анхны хуваарь руу буцаах"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Анхны хуваарь</span>
                </button>
              )
            )}

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'single' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Гарагаар харах
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'all' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Бүх 5 өдөр (Хүснэгт)
              </button>
            </div>
          </div>
        </div>

        {saveMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveMessage}</span>
            </div>
            <button
              onClick={() => setSaveMessage(null)}
              className="p-0.5 text-emerald-700 hover:text-emerald-900 rounded"
              aria-label="Хаах"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Weekday Switcher Tabs */}
        {viewMode === 'single' && (
          <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs font-bold">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setActiveDay(day);
                  setEditingPeriod(null);
                }}
                className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeDay === day
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>{day} гараг</span>
                <span className="text-[10px] opacity-80">(7 цаг)</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SINGLE DAY VIEW: 7 periods */}
      {viewMode === 'single' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(timetable[activeDay] || []).map((period) => {
            const isEditing =
              editingPeriod?.day === activeDay && editingPeriod?.periodNumber === period.periodNumber;

            return (
              <div
                key={period.periodNumber}
                className={`bg-white border rounded-2xl p-4 shadow-xs transition-colors space-y-2 relative ${
                  isEditing ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center font-mono">
                      {period.periodNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {period.timeSlot}
                    </span>
                  </div>

                  {isAdmin && !isEditing && (
                    <button
                      onClick={() => handleStartEdit(activeDay, period)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Хичээл засах"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Засах</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Хичээлийн нэр:</label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-blue-400 rounded-lg text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Цагийн хуваарь:</label>
                      <input
                        type="text"
                        value={editTimeSlot}
                        onChange={(e) => setEditTimeSlot(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        placeholder="08:00 - 08:45"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Багш:</label>
                        <input
                          type="text"
                          value={editTeacher}
                          onChange={(e) => setEditTeacher(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Өрөө:</label>
                        <input
                          type="text"
                          value={editRoom}
                          onChange={(e) => setEditRoom(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingPeriod(null)}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Болих
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs"
                      >
                        <Save className="w-3 h-3" />
                        Хадгалах
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {period.subject}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>Багш: {period.teacher || '—'}</span>
                      <span className="font-mono text-blue-700 font-semibold">{period.room || '—'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ALL 5 DAYS GRID VIEW */}
      {viewMode === 'all' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {isAdmin && (
            <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-800 font-medium flex items-center justify-between">
              <span>Аль ч нүд дээр дарж тухайн өдрийн цагийн хичээлийг шууд засаж хадгалах боломжтой.</span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold w-24 text-center border-r border-blue-600">Цаг</th>
                  {WEEKDAYS.map((day) => (
                    <th key={day} className="py-2.5 px-3 font-extrabold text-center border-r border-blue-600 min-w-[170px]">
                      {day} гараг
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5, 6, 7].map((pNum) => (
                  <tr key={pNum} className="hover:bg-blue-50/20">
                    <td className="py-3 px-2 text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200 font-mono">
                      <div>{pNum}-р цаг</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {(timetable['Даваа'] || []).find((p) => p.periodNumber === pNum)?.timeSlot}
                      </div>
                    </td>
                    {WEEKDAYS.map((day) => {
                      const period = (timetable[day] || []).find((p) => p.periodNumber === pNum);
                      return (
                        <td
                          key={day}
                          onClick={() => isAdmin && period && handleStartEdit(day, period)}
                          className={`py-2.5 px-3 border-r border-slate-200/60 align-top transition-colors ${
                            isAdmin ? 'cursor-pointer hover:bg-blue-50/60 group' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-bold text-slate-900">
                              {period?.subject || 'Хичээлгүй'}
                            </div>
                            {isAdmin && (
                              <Edit2 className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between mt-0.5 gap-2">
                            <span className="truncate">{period?.teacher || '—'}</span>
                            <span className="font-mono text-blue-700 shrink-0">{period?.room || '—'}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Edit Modal for 5-Day Table View */}
      {viewMode === 'all' && editingPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-blue-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-blue-600 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-blue-100 font-bold uppercase tracking-wider">
                  Хичээлийн хуваарь засах
                </div>
                <h3 className="text-base font-extrabold">
                  {editingPeriod.day} гараг · {editingPeriod.periodNumber}-р цаг
                </h3>
              </div>
              <button
                onClick={() => setEditingPeriod(null)}
                className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors"
                aria-label="Хаах"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Хичээлийн нэр:</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-50 border border-blue-400 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Цагийн хуваарь:</label>
                <input
                  type="text"
                  value={editTimeSlot}
                  onChange={(e) => setEditTimeSlot(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  placeholder="08:00 - 08:45"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Багш:</label>
                  <input
                    type="text"
                    value={editTeacher}
                    onChange={(e) => setEditTeacher(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Өрөө:</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setEditingPeriod(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Болих
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
