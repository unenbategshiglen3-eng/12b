import React, { useState } from 'react';
import { ClassroomConfig, WeekdayName, PeriodInfo } from '../types';
import { WEEKDAYS } from '../data/mockStudents';
import { Calendar, Clock, Edit2, Save, X } from 'lucide-react';

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

  const timetable = config.weeklyTimetable;

  const handleStartEdit = (day: WeekdayName, period: PeriodInfo) => {
    if (!isAdmin) return;
    setEditingPeriod({ day, periodNumber: period.periodNumber });
    setEditSubject(period.subject);
    setEditTeacher(period.teacher);
    setEditRoom(period.room);
  };

  const handleSaveEdit = () => {
    if (!editingPeriod) return;
    const { day, periodNumber } = editingPeriod;
    const dayPeriods = timetable[day] || [];
    const updatedDayPeriods = dayPeriods.map((p) =>
      p.periodNumber === periodNumber
        ? { ...p, subject: editSubject.trim(), teacher: editTeacher.trim(), room: editRoom.trim() }
        : p
    );

    const updatedTimetable = {
      ...timetable,
      [day]: updatedDayPeriods,
    };

    onUpdateWeeklyTimetable(updatedTimetable);
    setEditingPeriod(null);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
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

          <div className="flex items-center gap-2">
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

        {/* Weekday Switcher Tabs */}
        {viewMode === 'single' && (
          <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs font-bold">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
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
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-xs transition-colors space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center font-mono">
                      {period.periodNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {period.timeSlot}
                    </span>
                  </div>

                  {isAdmin && !isEditing && (
                    <button
                      onClick={() => handleStartEdit(activeDay, period)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Хичээл засах"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Хичээл:</label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-blue-400 rounded text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Багш:</label>
                      <input
                        type="text"
                        value={editTeacher}
                        onChange={(e) => setEditTeacher(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Өрөө:</label>
                      <input
                        type="text"
                        value={editRoom}
                        onChange={(e) => setEditRoom(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingPeriod(null)}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded"
                      >
                        Болих
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-2.5 py-1 text-[11px] bg-blue-600 text-white font-bold rounded"
                      >
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
                      <span>Багш: {period.teacher}</span>
                      <span className="font-mono text-blue-700 font-semibold">{period.room}</span>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold w-20 text-center border-r border-blue-600">Цаг</th>
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
                      {pNum}-р цаг
                    </td>
                    {WEEKDAYS.map((day) => {
                      const period = (timetable[day] || []).find((p) => p.periodNumber === pNum);
                      return (
                        <td key={day} className="py-2.5 px-3 border-r border-slate-200/60 align-top">
                          <div className="font-bold text-slate-900">
                            {period?.subject || 'Хичээлгүй'}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between mt-0.5">
                            <span>{period?.teacher}</span>
                            <span className="font-mono text-blue-700">{period?.room}</span>
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
    </div>
  );
};
