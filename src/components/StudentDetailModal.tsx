import React, { useState, useEffect } from 'react';
import { Student, NoteEntry, DailyClassLog, PeriodInfo } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { X, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  dailyLog: DailyClassLog;
  periods?: PeriodInfo[];
  adminName?: string;
  isAdmin: boolean;
  onClose: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  dailyLog,
  periods,
  adminName,
  isAdmin,
  onClose,
  onUpdateStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'remarks' | 'attendance'>('profile');

  const [formData, setFormData] = useState<Student | null>(student ? { ...student } : null);
  const [newTagInput, setNewTagInput] = useState('');
  const [newRemarkCategory, setNewRemarkCategory] = useState<NoteEntry['category']>('Сургалт');
  const [newRemarkText, setNewRemarkText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(student ? { ...student } : null);
  }, [student]);

  if (!student || !formData) return null;

  const todayRecord = dailyLog.records[student.id];
  const todayPeriods = todayRecord?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };

  let todayPresentCount = 0;
  for (let p = 1; p <= 7; p++) {
    const s = todayPeriods[p] || 'present';
    if (s === 'present' || s === 'excused') todayPresentCount++;
  }

  const handleSave = () => {
    onUpdateStudent(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddTag = () => {
    if (!isAdmin || !newTagInput.trim()) return;
    if (formData.tags.includes(newTagInput.trim())) return;
    setFormData({
      ...formData,
      tags: [...formData.tags, newTagInput.trim()],
    });
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!isAdmin) return;
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleAddRemark = () => {
    if (!newRemarkText.trim()) return;
    const newEntry: NoteEntry = {
      id: `note-${student.id}-${Date.now()}`,
      date: getTodayDateString(),
      author: isAdmin ? (adminName || 'Администратор') : `${student.lastName} ${student.firstName}`,
      category: isAdmin ? newRemarkCategory : 'Чөлөө хүсэлт',
      content: newRemarkText.trim(),
    };
    const updated = {
      ...formData,
      notesLog: [newEntry, ...formData.notesLog],
    };
    setFormData(updated);
    onUpdateStudent(updated);
    setNewRemarkText('');
  };

  const handleDeleteRemark = (noteId: string) => {
    if (!isAdmin) return;
    const updated = {
      ...formData,
      notesLog: formData.notesLog.filter((n) => n.id !== noteId),
    };
    setFormData(updated);
    onUpdateStudent(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-blue-200">
        {/* Top Header in Blue Highlight */}
        <div className="bg-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-blue-900 border border-blue-200 flex flex-col items-center justify-center font-extrabold text-lg font-mono tabular-nums shrink-0 shadow-md">
              <span className="text-[10px] text-blue-600 font-sans uppercase">№</span>
              <span>{formData.rollNumber}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  {formData.lastName} {formData.firstName}
                </h2>
                <span className="font-mono text-xs text-blue-200">
                  ({formData.id})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100 mt-1">
                <span>Төрсөн: {formData.dateOfBirth}</span>
                {formData.bloodGroup && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Цусны бүлэг: {formData.bloodGroup}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-blue-600/70 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Хувийн & Асран хамгаалагч
            </button>
            <button
              onClick={() => setActiveTab('remarks')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'remarks'
                  ? 'bg-white text-blue-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Тэмдэглэл & Архивын бүртгэл ({formData.notesLog.length})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-white text-blue-950 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Өнөөдрийн 7 цагийн ирц
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[500px] overflow-y-auto text-xs space-y-4">
          {!isAdmin && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Зөвхөн харах эрхтэй байна. Мэдээллийг ангийн багш (Администратор) албан ёсоор засварлана.</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Сурагчийн мэдээлэл амжилттай хадгалагдлаа!
            </div>
          )}

          {/* TAB 1: Profile & Guardian */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Овог</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-white disabled:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Нэр</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-white disabled:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">И-мэйл хаяг</label>
                  <input
                    type="email"
                    disabled={!isAdmin}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white disabled:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Сурагчийн утас</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white disabled:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Guardian Info */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <h4 className="font-bold text-blue-900 text-sm">Асран хамгаалагчийн мэдээлэл</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Асран хамгаалагчийн нэр</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white disabled:bg-slate-100 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Холбоо хамаарал</label>
                    <select
                      disabled={!isAdmin}
                      value={formData.guardianRelation}
                      onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white disabled:bg-slate-100 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="Аав">Аав</option>
                      <option value="Ээж">Ээж</option>
                      <option value="Асран хамгаалагч">Асран хамгаалагч</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Холбоо барих үндсэн утас</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white disabled:bg-slate-100 border border-slate-200 rounded-lg focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Цахим шуудан</label>
                    <input
                      type="email"
                      disabled={!isAdmin}
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white disabled:bg-slate-100 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* Student Own Phone & Backup Phone Section */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                  <div>
                    <label className="block text-blue-900 font-bold mb-1">Өөрийн дугаар (Сануулга авах):</label>
                    <input
                      type="text"
                      placeholder="Утасны дугаараа оруулна уу"
                      value={formData.phone || formData.fatherPhone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value, fatherPhone: e.target.value, guardianPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg focus:outline-none font-mono font-bold text-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-900 font-bold mb-1">Нөөц дугаар (Сонголттой):</label>
                    <input
                      type="text"
                      placeholder="Нөөц утасны дугаар"
                      value={formData.motherPhone || ''}
                      onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg focus:outline-none font-mono font-bold text-blue-950"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Оршин суугаа хаяг</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white disabled:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Тусгай бүлэг, клуб & Автобус</label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200"
                    >
                      <span>{tag}</span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-400 hover:text-blue-700"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Шинэ клуб, тэмдэглэгээ нэмэх..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                    >
                      Нэмэх
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}



          {/* TAB 3: Remarks */}
          {activeTab === 'remarks' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <h4 className="font-bold text-blue-900 text-sm">
                  {isAdmin ? 'Албан ёсны тэмдэглэл нэмэх' : 'Багшид чөлөө хүсэх / Тэмдэглэл илгээх'}
                </h4>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <label className="text-slate-600 font-semibold">Төрөл:</label>
                    <select
                      value={newRemarkCategory}
                      onChange={(e) => setNewRemarkCategory(e.target.value as any)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium"
                    >
                      <option value="Сургалт">Сургалт, амжилт</option>
                      <option value="Зан байдал">Зан байдал, ёс зүй</option>
                      <option value="Эрүүл мэнд">Эрүүл мэнд, ирц</option>
                      <option value="Захиргаа">Захиргааны шийдвэр</option>
                      <option value="Чөлөө хүсэлт">Чөлөө хүсэлт</option>
                    </select>
                  </div>
                )}
                <textarea
                  rows={2}
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  placeholder={isAdmin ? "Ангийн журналын албан тэмдэглэл бичих..." : "Багшид хүсэлтээ бичнэ үү..."}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddRemark}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Хадгалж оруулах
                </button>
              </div>

              {/* Existing Remarks List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Он дарааллын тэмдэглэлүүд:</h4>
                {formData.notesLog.length === 0 ? (
                  <p className="text-slate-400 italic">Тэмдэглэл байхгүй байна.</p>
                ) : (
                  formData.notesLog.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-bold text-blue-700">{note.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{note.date}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-700">{note.author}</span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed">{note.content}</p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRemark(note.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Устгах"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}



          {/* TAB 5: Attendance */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Өнөөдрийн 7 цагийн ирц</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Огноо: {dailyLog.date} · {todayPresentCount}/7 Цагт ирсэн
                  </p>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-800">
                  Хувцас:{' '}
                  {todayRecord?.uniform.status === 'compliant'
                    ? 'БҮРЭН'
                    : todayRecord?.uniform.status === 'partial'
                    ? 'ДУТУУ'
                    : todayRecord?.uniform.status === 'exempt'
                    ? 'ЧӨЛӨӨТЭЙ'
                    : 'ЗӨРЧИЛТЭЙ'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                  const status = todayPeriods[pNum] || 'present';
                  const periodSubject =
                    periods?.find((p) => p.periodNumber === pNum)?.subject ||
                    ['Математик', 'Монгол хэл, Уран зохиол', 'Физик', 'Түүх, Нийгэм', 'Англи хэл', 'Мэдээлэл зүй', 'Биеийн тамир'][pNum - 1];
                  return (
                    <div
                      key={pNum}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-blue-900 font-mono">{pNum}-р цаг</span>
                        <div className="text-[11px] text-slate-500">
                          {periodSubject}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase ${
                        status === 'present' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        status === 'late' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        status === 'absent' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {status === 'present' ? 'ИРСЭН' : status === 'late' ? 'ХОЦОРСОН' : status === 'absent' ? 'ТАСАЛСАН' : 'ЧӨЛӨӨТЭЙ'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isAdmin ? 'Өөрчлөлт ангийн үндсэн санд шууд хадгалагдана.' : 'Та сурагчийн харах горимд байна.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Хаах
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isAdmin ? 'Хадгалах' : 'Утас, мэдээлэл хадгалах'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
