import React, { useState } from 'react';
import { Student, DailyClassLog, ClassroomConfig } from '../types';
import { Printer, Download, RefreshCw } from 'lucide-react';
import { exportDailyAttendanceCSV } from '../utils/storage';

interface DailyReportPrintViewProps {
  students: Student[];
  dailyLog: DailyClassLog;
  currentDate: string;
  config: ClassroomConfig;
  onResetData: () => void;
}

export const DailyReportPrintView: React.FC<DailyReportPrintViewProps> = ({
  students,
  dailyLog,
  currentDate,
  config,
  onResetData,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  let totalPresentDays = 0;
  let totalLateCount = 0;
  let totalAbsentCount = 0;
  let compliantUniforms = 0;

  students.forEach((stu) => {
    const rec = dailyLog.records[stu.id];
    const pMap = rec?.periods || {};
    let studentPresentCount = 0;
    for (let p = 1; p <= 7; p++) {
      if (pMap[p] === 'present' || pMap[p] === 'excused') studentPresentCount++;
      if (pMap[p] === 'late') totalLateCount++;
      if (pMap[p] === 'absent') totalAbsentCount++;
    }
    if (studentPresentCount >= 5) totalPresentDays++;

    if (rec?.uniform.status === 'compliant' || rec?.uniform.status === 'exempt') {
      compliantUniforms++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Hidden during print) */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Албан ёсны журнал & Хэвлэх хэсэг
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Сургуулийн захиргаа, сургалтын менежер болон архивт зориулсан баталгаажуулсан хэвлэмэл тайлан.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Журнал хэвлэх (Ctrl+P)
            </button>

            <button
              onClick={() => exportDailyAttendanceCSV(currentDate, students, dailyLog, config)}
              className="px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Ирцийн CSV татах
            </button>

            {confirmReset ? (
              <div className="flex items-center gap-1.5 ml-auto bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1">
                <span className="text-[11px] font-bold text-rose-800">Анхны өгөгдөл сэргээх үү?</span>
                <button
                  onClick={() => {
                    setConfirmReset(false);
                    onResetData();
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  Тийм
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors"
                >
                  Болих
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ml-auto"
                title="Анхны демо өгөгдлийг сэргээх"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Өгөгдөл шинэчлэх
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 / Letter styling) */}
      <div className="bg-white border border-slate-300 rounded-2xl p-8 shadow-sm print:border-none print:shadow-none print:p-0 max-w-5xl mx-auto">
        {/* School Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">
            БОЛОВСРОЛ, ШИНЖЛЭХ УХААНЫ ЯАМ
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
            {config.schoolName}
          </h1>
          <div className="text-sm font-bold text-blue-900 mt-1">
            Өдрийн 7 цагийн ирц, дүрэмт хувцасны албан журнал
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 mt-4 pt-3 border-t border-slate-200 font-medium">
            <div>
              <span className="font-bold text-slate-900">Анги:</span> {config.className}
            </div>
            <div>
              <span className="font-bold text-slate-900">Танхим:</span> {config.roomNumber}
            </div>
            <div>
              <span className="font-bold text-slate-900">Огноо:</span> {currentDate}
            </div>
            <div>
              <span className="font-bold text-slate-900">Администратор:</span> {config.adminName}
            </div>
          </div>
        </div>

        {/* Daily Summary Metrics Box */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-xs mb-6 font-mono tabular-nums">
          <div>
            <span className="text-slate-500 block font-sans">Нийт сурагчид:</span>
            <span className="text-base font-bold text-slate-900">{students.length} Сурагч</span>
          </div>
          <div>
            <span className="text-slate-500 block font-sans">Өдрийн ирцийн хувь:</span>
            <span className="text-base font-bold text-emerald-700">
              {totalPresentDays} / {students.length} ({students.length > 0 ? Math.round((totalPresentDays / students.length) * 100) : 100}%)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-sans">Дүрэмт хувцаслалт:</span>
            <span className="text-base font-bold text-blue-900">
              {compliantUniforms} / {students.length} ({students.length > 0 ? Math.round((compliantUniforms / students.length) * 100) : 100}%)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-sans">Баталгаажуулалт:</span>
            <span className="text-base font-bold text-blue-700">Багш гарын үсэг зурсан</span>
          </div>
        </div>

        {/* Full 34 Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 font-bold text-slate-900">
                <th className="py-2 px-2 text-center w-8">№</th>
                <th className="py-2 px-2 min-w-[150px]">Сурагчийн нэр</th>
                <th className="py-2 px-1 text-center w-9">1-р</th>
                <th className="py-2 px-1 text-center w-9">2-р</th>
                <th className="py-2 px-1 text-center w-9">3-р</th>
                <th className="py-2 px-1 text-center w-9">4-р</th>
                <th className="py-2 px-1 text-center w-9">5-р</th>
                <th className="py-2 px-1 text-center w-9">6-р</th>
                <th className="py-2 px-1 text-center w-9">7-р</th>
                <th className="py-2 px-2 text-center min-w-[85px]">Хувцас</th>
                <th className="py-2 px-2 min-w-[140px]">Тэмдэглэл / Шалтгаан</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((stu) => {
                const rec = dailyLog.records[stu.id];
                const p = rec?.periods || { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present' };

                return (
                  <tr key={stu.id} className="hover:bg-slate-50">
                    <td className="py-1 px-2 text-center font-mono font-bold text-slate-600 tabular-nums">
                      {stu.rollNumber}
                    </td>
                    <td className="py-1 px-2 font-bold text-slate-900">
                      {stu.lastName} {stu.firstName}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                      const st = p[pNum] || 'present';
                      const code = st === 'present' ? 'И' : st === 'late' ? 'Х' : st === 'absent' ? 'Т' : 'Ч';
                      const colorClass =
                        code === 'Т' ? 'text-rose-700 font-extrabold bg-rose-50' :
                        code === 'Х' ? 'text-amber-700 font-bold bg-amber-50' :
                        code === 'Ч' ? 'text-blue-700 font-bold' : 'text-slate-800';

                      return (
                        <td key={pNum} className={`py-1 px-1 text-center font-mono tabular-nums ${colorClass}`}>
                          {code}
                        </td>
                      );
                    })}
                    <td className="py-1 px-2 text-center text-[10px]">
                      {rec?.uniform.status === 'compliant' && <span className="text-emerald-700 font-bold">Бүрэн</span>}
                      {rec?.uniform.status === 'partial' && <span className="text-amber-700 font-bold">Дутуу</span>}
                      {rec?.uniform.status === 'non_compliant' && <span className="text-rose-700 font-bold">Зөрчил</span>}
                      {rec?.uniform.status === 'exempt' && <span className="text-blue-700 font-bold">Чөлөө</span>}
                    </td>
                    <td className="py-1 px-2 text-[10px] text-slate-600 truncate max-w-[160px]">
                      {rec?.dailyRemark || (rec?.uniform.violationReason ? `Хувцас: ${rec.uniform.violationReason}` : '—')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs text-slate-700 print-break-inside-avoid">
          <div>
            <div className="font-bold text-slate-900 mb-6">Ангийн багш (Администратор):</div>
            <div className="border-b border-slate-400 pb-1 font-mono text-slate-800 font-semibold">
              {config.adminName}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Гарын үсэг, огноо</div>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-6">Сургалтын менежер:</div>
            <div className="border-b border-slate-400 pb-1 font-mono text-slate-400">
              ___________________________
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Шалгаж зөвшөөрсөн</div>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-6">Сургуулийн тамга:</div>
            <div className="h-12 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-medium">
              [ ТАМГА / ТЭМДЭГ ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
