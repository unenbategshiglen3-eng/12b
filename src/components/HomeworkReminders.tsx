import React, { useState } from 'react';
import { HomeworkItem, WeekdayName, Student } from '../types';
import { WEEKDAYS } from '../data/mockStudents';
import { BookOpen, Plus, Calendar, Clock, CheckCircle2, AlertCircle, Copy, Check, MessageSquare, Trash2 } from 'lucide-react';

interface HomeworkRemindersProps {
  homework: HomeworkItem[];
  isAdmin: boolean;
  currentStudentId?: string;
  onAddHomework: (item: Omit<HomeworkItem, 'id' | 'completedBy' | 'assignedDate'>) => void;
  onToggleComplete: (homeworkId: string, studentId: string) => void;
  onDeleteHomework?: (homeworkId: string) => void;
}

export const HomeworkReminders: React.FC<HomeworkRemindersProps> = ({
  homework,
  isAdmin,
  currentStudentId,
  onAddHomework,
  onToggleComplete,
  onDeleteHomework,
}) => {
  const [selectedDay, setSelectedDay] = useState<WeekdayName | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Homework Form State
  const [subject, setSubject] = useState('Математик');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weekday, setWeekday] = useState<WeekdayName>('Даваа');
  const [periodNumber, setPeriodNumber] = useState(1);
  const [dueDate, setDueDate] = useState('2026-11-10');
  const [dueTime, setDueTime] = useState('08:00');
  const [priority, setPriority] = useState<'Яаралтай' | 'Чухал' | 'Энгийн'>('Чухал');
  const [teacherName, setTeacherName] = useState('Д. Батбаяр');

  const filteredHomework = homework.filter((item) => {
    if (selectedDay === 'all') return true;
    return item.weekday === selectedDay;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHomework({
      subject,
      title: title.trim(),
      description: description.trim(),
      weekday,
      periodNumber,
      dueDate,
      dueTime,
      priority,
      teacherName,
    });

    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  const handleCopyParentSms = (item: HomeworkItem) => {
    const text = `[12Б анги - Гэрийн даалгаврын сануулга]\nХичээл: ${item.subject}\nДаалгавар: ${item.title}\nХугацаа: ${item.dueDate} ${item.dueTime}\nТайлбар: ${item.description}\nБагш: ${item.teacherName}\nЭцэг эхчүүд хүүхдийнхээ даалгаврыг хянана уу.`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
              <span>5 өдрийн хичээлийн хуваарийн дагуу</span>
              <span aria-hidden="true">·</span>
              <span>12Б анги</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{homework.length} Идэвхтэй даалгавар</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Гэрийн даалгаврын нэгдсэн сануулга</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                + Шинэ даалгавар өгөх
              </button>
            )}
          </div>
        </div>

        {/* 5-Day Filter Buttons */}
        <div className="flex items-center gap-1.5 pt-4 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedDay === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-blue-600'
            }`}
          >
            Бүх 5 өдөр ({homework.length})
          </button>
          {WEEKDAYS.map((day) => {
            const count = homework.filter((h) => h.weekday === day).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-blue-600'
                }`}
              >
                <span>{day} гараг</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedDay === day ? 'bg-white text-blue-700 font-extrabold' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHomework.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl text-xs">
            Энэ өдөрт бүртгэгдсэн гэрийн даалгавар байхгүй байна.
          </div>
        ) : (
          filteredHomework.map((item) => {
            const isCompleted = currentStudentId ? item.completedBy.includes(currentStudentId) : false;
            const completedCount = item.completedBy.length;

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-3 ${
                  isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                        {item.weekday} · {item.periodNumber}-р цаг
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {item.subject}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        item.priority === 'Яаралтай' ? 'bg-rose-100 text-rose-700' :
                        item.priority === 'Чухал' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 pt-1">
                      {item.title}
                    </h3>
                  </div>

                  {isAdmin && onDeleteHomework && (
                    <button
                      onClick={() => onDeleteHomework(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Даалгавар устгах"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-blue-700 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Дуусах: {item.dueDate} {item.dueTime}
                    </span>
                    <span className="text-[11px]">
                      Багш: {item.teacherName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy SMS to Parents */}
                    <button
                      onClick={() => handleCopyParentSms(item)}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                      title="Эцэг эхийн утсанд сануулах мессежийг хуулах"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {copiedId === item.id ? 'Хуулагдлаа!' : 'Эцэг эхийн сануулга'}
                    </button>

                    {/* Student complete toggle */}
                    {currentStudentId && (
                      <button
                        onClick={() => onToggleComplete(item.id, currentStudentId)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isCompleted ? 'Хийсэн ✓' : 'Хийх гэж тэмдэглэх'}
                      </button>
                    )}

                    {isAdmin && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {completedCount}/34 сурагч хийсэн
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Homework Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-blue-200">
            <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">Шинэ гэрийн даалгавар өгөх</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-blue-200 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">5 өдрийн гараг</label>
                  <select
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value as WeekdayName)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    {WEEKDAYS.map((w) => (
                      <option key={w} value={w}>{w} гараг</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Цаг (1-7)</label>
                  <select
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <option key={p} value={p}>{p}-р цаг</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Хичээлийн нэр</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Жишээ: Математик, Физик, Англи хэл..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Даалгаврын гарчиг</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Жишээ: 4-р бүлгийн бодлогууд"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Дэлгэрэнгүй заавар / Хуудас</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Сурах бичгийн хуудас, дасгал, анхаарах зүйлс..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Хүлээлгэн өгөх огноо</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Хүлээлгэн өгөх цаг</label>
                  <input
                    type="time"
                    required
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Зэрэглэл</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Яаралтай">Яаралтай</option>
                    <option value="Чухал">Чухал</option>
                    <option value="Энгийн">Энгийн</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Багшийн нэр</label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Нийтлэх & Сануулах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
