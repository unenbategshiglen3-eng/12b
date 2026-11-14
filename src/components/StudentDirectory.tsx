import React, { useState } from 'react';
import { Student } from '../types';
import { Search, Plus, Phone, CheckCircle2, UserX } from 'lucide-react';

interface StudentDirectoryProps {
  students: Student[];
  className?: string;
  isAdmin: boolean;
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  className = '12Б анги',
  isAdmin,
  onSelectStudent,
  onOpenAddStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');

  const BANNED_TAGS = new Set([
    'Class Monitor', 'Mathematics', 'Bus 1', 'Robotics', 'Honor Student',
    'Ангийн дарга', 'Математик', '1-р автобус', 'Робот техник', 'Робот', 'Онц сурлагатан'
  ]);

  const allTags = Array.from(new Set(students.flatMap((s) => s.tags))).filter(
    (tag) => !BANNED_TAGS.has(tag)
  );

  const filteredStudents = students.filter((stu) => {
    const fullName = `${stu.lastName} ${stu.firstName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      stu.rollNumber.toString() === searchQuery.trim() ||
      stu.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stu.fatherPhone && stu.fatherPhone.includes(searchQuery.trim())) ||
      (stu.motherPhone && stu.motherPhone.includes(searchQuery.trim()));

    if (!matchesSearch) return false;

    if (tagFilter === 'all') return true;
    return stu.tags.includes(tagFilter);
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
              <span>Сурагчдын албан ёсны лавлах</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{students.length} Сурагч бүртгэлтэй</span>
              <span aria-hidden="true">·</span>
              <span>{className}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Сурагчдын хувийн хэрэг, өөрийн дугаар & Холбоо барих мэдээлэл
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onOpenAddStudent}
                className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Шинэ сурагч бүртгэх
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`${students.length} сурагчаас нэр, ID, асран хамгаалагчаар хайх...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Tag filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <button
              onClick={() => setTagFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                tagFilter === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-blue-600'
              }`}
            >
              Бүгд ({students.length})
            </button>
            {allTags.slice(0, 5).map((t) => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  tagFilter === t
                    ? 'bg-blue-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Table View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-blue-50 text-blue-900 border-b border-blue-200">
              <tr>
                <th className="py-2.5 px-3 font-bold w-12 text-center">№</th>
                <th className="py-2.5 px-3 font-bold min-w-[190px]">Сурагчийн нэр, код</th>
                <th className="py-2.5 px-3 font-bold min-w-[180px]">Өөрийн дугаар & Холбоо барих</th>
                <th className="py-2.5 px-3 font-bold min-w-[150px]">Клуб & Тэмдэглэгээ</th>
                <th className="py-2.5 px-3 font-bold text-center min-w-[100px]">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Хайлтад тохирох сурагч олдсонгүй.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {

                  return (
                    <tr
                      key={stu.id}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      {/* Roll Number */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-500 tabular-nums">
                        {stu.rollNumber}
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => onSelectStudent(stu)}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left text-sm"
                          >
                            {stu.lastName} {stu.firstName}
                          </button>
                          {stu.accountRegistered || stu.lastLoginAt ? (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                              title={stu.lastLoginAt ? `Сүүлд нэвтэрсэн: ${stu.lastLoginAt}` : 'Системд бүртгүүлж нэвтэрсэн'}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Нэвтэрсэн</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                              <UserX className="w-2.5 h-2.5" />
                              <span>Ороогүй</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span>{stu.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>Төрсөн: {stu.dateOfBirth}</span>
                          {stu.lastLoginAt && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-700 font-semibold">Орсон: {stu.lastLoginAt}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Student Own Phone & Contact Info */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-mono tabular-nums flex flex-col gap-0.5">
                          {(stu.phone || stu.fatherPhone) ? (
                            <span className="flex items-center gap-1 text-blue-700 font-bold" title="Өөрийн дугаар">
                              <Phone className="w-3 h-3 text-blue-600" />
                              <span className="text-[10px] text-slate-500 font-sans font-normal">Өөрийн дугаар:</span> {stu.phone || stu.fatherPhone}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400 italic">
                              <Phone className="w-3 h-3 text-slate-300" />
                              <span>Өөрийн дугаар: Оруулаагүй</span>
                            </span>
                          )}
                          {stu.motherPhone && (
                            <span className="flex items-center gap-1 text-slate-600" title="Нөөц дугаар">
                              <span className="text-[10px] text-slate-400 font-sans">Нөөц дугаар:</span> {stu.motherPhone}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {stu.guardianName} ({stu.guardianRelation})
                        </div>
                      </td>

                      {/* Tags without banned tags */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {stu.tags.filter((t) => !BANNED_TAGS.has(t)).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-medium border border-blue-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectStudent(stu)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            {isAdmin ? 'Засах' : 'Харах'}
                          </button>
                        </div>
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
  );
};
