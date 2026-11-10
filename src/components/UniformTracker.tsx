import React, { useState } from 'react';
import { Student, DailyClassLog, UniformStatus } from '../types';
import { Check, X, Clock, ShieldCheck, AlertCircle, Search, Copy, CheckCheck, Shirt, Lock } from 'lucide-react';

interface UniformTrackerProps {
  students: Student[];
  dailyLog: DailyClassLog;
  currentDate: string;
  isAdmin: boolean;
  onUpdateUniform: (
    studentId: string,
    status: UniformStatus,
    reason?: string,
    resolved?: boolean
  ) => void;
  onMarkAllCompliant: () => void;
  onSelectStudent: (student: Student) => void;
}

export const UniformTracker: React.FC<UniformTrackerProps> = ({
  students,
  dailyLog,
  currentDate,
  isAdmin,
  onUpdateUniform,
  onMarkAllCompliant,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'violations' | 'compliant' | 'exempt'>('all');
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);

  let compliantCount = 0;
  let nonCompliantCount = 0;
  let partialCount = 0;
  let exemptCount = 0;

  students.forEach((stu) => {
    const status = dailyLog.records[stu.id]?.uniform.status || 'compliant';
    if (status === 'compliant') compliantCount++;
    else if (status === 'non_compliant') nonCompliantCount++;
    else if (status === 'partial') partialCount++;
    else if (status === 'exempt') exemptCount++;
  });

  const totalViolations = nonCompliantCount + partialCount;
  const complianceRate = Math.round(((compliantCount + exemptCount) / students.length) * 100);

  const filteredStudents = students.filter((stu) => {
    const fullName = `${stu.lastName} ${stu.firstName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      stu.rollNumber.toString() === searchQuery.trim();

    if (!matchesSearch) return false;

    const status = dailyLog.records[stu.id]?.uniform.status || 'compliant';
    if (filter === 'violations') return status === 'non_compliant' || status === 'partial';
    if (filter === 'compliant') return status === 'compliant';
    if (filter === 'exempt') return status === 'exempt';
    return true;
  });

  const generateParentNotice = (student: Student, reason?: string) => {
    const text = `Сайн байна уу, ${student.guardianName} танаа:\nНийслэлийн 1-р сургуулийн 10А ангийн сурагч ${student.lastName} ${student.firstName} (№${student.rollNumber})-ийн өнөөдрийн (${currentDate}) өглөөний дүрэмт хувцасны үзлэгээр дараах зөрчил тэмдэглэгдлээ: "${reason || 'Дүрэмт хувцас дутуу/зөрчилтэй'}". Маргаашийн хичээлд дүрэмт хувцсыг бүрэн өмсүүлж ирүүлэхийг хүсье.\nХүндэтгэсэн: Ангийн багш, Администратор Ү. Эгшиглэн`;
    navigator.clipboard.writeText(text);
    setCopiedStudentId(student.id);
    setTimeout(() => setCopiedStudentId(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner highlighted in Blue */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
              <span>Өглөөний ерөнхий үзлэг</span>
              <span aria-hidden="true">·</span>
              <span>Огноо: {currentDate}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{students.length} Сурагч шалгагдсан</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Shirt className="w-5 h-5 text-blue-600" />
              <span>Дүрэмт хувцасны стандарт & Үзлэгийн бүртгэл</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                onClick={onMarkAllCompliant}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <CheckCheck className="w-4 h-4" />
                Бүх 34 сурагчийг бүрэн гэж тэмдэглэх
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Зөвхөн админ хувцасны үзлэг засах эрхтэй</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 block">Хувцаслалтын хувь</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono tabular-nums text-blue-700">
                {complianceRate}%
              </span>
              <span className="text-slate-400 font-mono tabular-nums">
                ({compliantCount + exemptCount}/{students.length})
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 block">Бүрэн хувцастай</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
              {compliantCount} сурагч
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Зөрчилтэй / Дутуу</span>
            <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-0.5 block">
              {totalViolations} сурагч
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Албан ёсны чөлөөтэй</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-700 mt-0.5 block">
              {exemptCount} сурагч
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Сурагчийн нэр, дугаараар хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Бүгд (34)
          </button>
          <button
            onClick={() => setFilter('violations')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'violations'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Зөрчилтэй ({totalViolations})
          </button>
          <button
            onClick={() => setFilter('compliant')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'compliant'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Бүрэн ({compliantCount})
          </button>
          <button
            onClick={() => setFilter('exempt')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'exempt'
                ? 'bg-blue-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-blue-800'
            }`}
          >
            Чөлөөтэй ({exemptCount})
          </button>
        </div>
      </div>

      {/* Uniform List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Шалгуурт тохирох сурагч олдсонгүй.
          </div>
        ) : (
          filteredStudents.map((stu) => {
            const uniform = dailyLog.records[stu.id]?.uniform || { status: 'compliant' };
            const isFlagged = uniform.status === 'non_compliant' || uniform.status === 'partial';

            return (
              <div
                key={stu.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isFlagged ? 'bg-amber-50/25' : 'hover:bg-blue-50/20'
                }`}
              >
                {/* Left: Student Identity */}
                <div className="flex items-start gap-3 min-w-[240px]">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold font-mono text-xs flex items-center justify-center shrink-0 border border-blue-200">
                    {stu.rollNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectStudent(stu)}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {stu.lastName} {stu.firstName}
                      </button>
                      <span className="font-mono text-xs text-slate-400 tabular-nums">
                        {stu.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{stu.guardianName}</span>
                      {(stu.phone || stu.fatherPhone) && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-blue-700 font-semibold">{stu.phone || stu.fatherPhone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Status Selector Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    disabled={!isAdmin}
                    onClick={() => onUpdateUniform(stu.id, 'compliant')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      uniform.status === 'compliant'
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    } ${!isAdmin ? 'cursor-default' : ''}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Бүрэн
                  </button>

                  <button
                    disabled={!isAdmin}
                    onClick={() =>
                      onUpdateUniform(
                        stu.id,
                        'partial',
                        uniform.violationReason || 'Дүрэмт хувцас дутуу'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      uniform.status === 'partial'
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    } ${!isAdmin ? 'cursor-default' : ''}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Дутуу
                  </button>

                  <button
                    disabled={!isAdmin}
                    onClick={() =>
                      onUpdateUniform(
                        stu.id,
                        'non_compliant',
                        uniform.violationReason || 'Дүрэмт хувцасны зөрчил'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      uniform.status === 'non_compliant'
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    } ${!isAdmin ? 'cursor-default' : ''}`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Зөрчил
                  </button>

                  <button
                    disabled={!isAdmin}
                    onClick={() =>
                      onUpdateUniform(
                        stu.id,
                        'exempt',
                        uniform.violationReason || 'Эмчийн чөлөө'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      uniform.status === 'exempt'
                        ? 'bg-blue-700 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    } ${!isAdmin ? 'cursor-default' : ''}`}
                  >
                    Чөлөө
                  </button>
                </div>

                {/* Right: Violation Note / Presets & Notice Generator */}
                <div className="flex-1 max-w-md flex items-center gap-2">
                  {isFlagged ? (
                    <div className="w-full flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          disabled={!isAdmin}
                          value={uniform.violationReason || ''}
                          onChange={(e) =>
                            onUpdateUniform(
                              stu.id,
                              uniform.status,
                              e.target.value,
                              uniform.resolved
                            )
                          }
                          placeholder={isAdmin ? "Зөрчлийн шалтгаан (гутал, зангиа, пиджак)..." : "Зөрчил бүртгэгдсэн"}
                          className={`w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                            !isAdmin ? 'bg-slate-50 cursor-default' : ''
                          }`}
                        />
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() =>
                            generateParentNotice(stu, uniform.violationReason)
                          }
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs rounded-lg font-bold transition-colors flex items-center gap-1 shrink-0 border border-blue-200"
                          title="Эцэг эх рүү явуулах мэдэгдлийг хуулах"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedStudentId === stu.id ? 'Хуулагдлаа!' : 'Мэдэгдэл'}
                        </button>
                      )}
                    </div>
                  ) : uniform.status === 'exempt' ? (
                    <div className="text-xs text-blue-700 font-semibold italic">
                      {uniform.violationReason || 'Албан ёсны чөлөөний бүртгэлтэй'}
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-700 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> Бүрэн дүрэмт хувцастай
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
