import React, { useMemo, useState } from 'react';
import { Student, StudentLoginEvent, UserAccount, ClassroomConfig } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import {
  CheckCircle2,
  Clock,
  LogIn,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react';

interface StudentLoginsViewProps {
  students: Student[];
  accounts: UserAccount[];
  loginEvents: StudentLoginEvent[];
  config: ClassroomConfig;
  isSyncing?: boolean;
  onRefreshLogins: () => void;
  onSelectStudent: (student: Student) => void;
}

export const StudentLoginsView: React.FC<StudentLoginsViewProps> = ({
  students,
  accounts,
  loginEvents,
  config,
  isSyncing = false,
  onRefreshLogins,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'logged_in' | 'not_logged_in' | 'today'>('all');

  const todayStr = getTodayDateString();

  // Build unified per-student login summary from events + accounts + student record
  const studentLoginRows = useMemo(() => {
    return students.map((stu) => {
      const stuEvents = loginEvents
        .filter((ev) => ev.studentId === stu.id || ev.rollNumber === stu.rollNumber)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      const account = accounts.find(
        (acc) => acc.role === 'student' && (acc.studentId === stu.id || acc.rollNumber === stu.rollNumber)
      );

      const latestEvent = stuEvents[0];
      const hasLoggedIn =
        stuEvents.length > 0 ||
        Boolean(account) ||
        Boolean(stu.accountRegistered) ||
        Boolean(stu.lastLoginAt);

      const lastLoginAt = latestEvent?.timestamp || stu.lastLoginAt || account?.lastLoginAt || (account ? account.createdAt : undefined);
      const lastDate = latestEvent?.date || (lastLoginAt ? lastLoginAt.slice(0, 10) : undefined);
      const loggedInToday = lastDate === todayStr;
      const loginCount = Math.max(stuEvents.length, stu.loginCount || 0, account?.loginCount || 0, account ? 1 : 0);
      const username = latestEvent?.username || account?.username || '';
      const phone = latestEvent?.phone || stu.phone || stu.fatherPhone || account?.parentPhone || '';

      return {
        student: stu,
        hasLoggedIn,
        loggedInToday,
        lastLoginAt,
        loginCount,
        username,
        phone,
        latestAction: latestEvent?.action || (account ? 'register' : undefined),
      };
    });
  }, [students, accounts, loginEvents, todayStr]);

  const loggedInCount = studentLoginRows.filter((r) => r.hasLoggedIn).length;
  const todayCount = studentLoginRows.filter((r) => r.loggedInToday).length;
  const notLoggedInCount = students.length - loggedInCount;
  const coveragePct = students.length > 0 ? Math.round((loggedInCount / students.length) * 100) : 0;

  const filteredRows = useMemo(() => {
    return studentLoginRows.filter((row) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const fullName = `${row.student.lastName} ${row.student.firstName}`.toLowerCase();
        const match =
          fullName.includes(q) ||
          String(row.student.rollNumber) === q ||
          row.student.id.toLowerCase().includes(q) ||
          row.phone.toLowerCase().includes(q) ||
          row.username.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (filterMode === 'logged_in') return row.hasLoggedIn;
      if (filterMode === 'not_logged_in') return !row.hasLoggedIn;
      if (filterMode === 'today') return row.loggedInToday;
      return true;
    });
  }, [studentLoginRows, searchQuery, filterMode]);

  const recentEvents = useMemo(
    () => [...loginEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [loginEvents]
  );

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
              <span>{config.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>{config.className}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{loggedInCount}/{students.length} сурагч нэвтэрсэн</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Хүүхдүүдийн системд нэвтэрсэн байдал ба бүртгэл</span>
            </h2>
          </div>

          <button
            onClick={onRefreshLogins}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Шинэчилж байна...' : 'Шинэчлэх'}</span>
          </button>
        </div>

        {/* 4 KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
              <span>Нэвтэрсэн сурагч</span>
              <span className="font-mono">{coveragePct}%</span>
            </div>
            <div className="text-2xl font-black font-mono tabular-nums text-emerald-900 mt-1">
              {loggedInCount}
              <span className="text-xs font-semibold text-emerald-700 font-sans"> / {students.length}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="text-[11px] font-bold text-blue-800">Өнөөдөр орсон</div>
            <div className="text-2xl font-black font-mono tabular-nums text-blue-900 mt-1">
              {todayCount}
              <span className="text-xs font-semibold text-blue-700 font-sans"> сурагч</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="text-[11px] font-bold text-amber-800">Огт нэвтрээгүй</div>
            <div className="text-2xl font-black font-mono tabular-nums text-amber-900 mt-1">
              {notLoggedInCount}
              <span className="text-xs font-semibold text-amber-700 font-sans"> сурагч</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-600">Нийт нэвтрэлт</div>
            <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
              {loginEvents.length}
              <span className="text-xs font-semibold text-slate-500 font-sans"> удаа</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split View: Roster Table + Chronological Login Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left 2 Columns: 34 Student Login Status List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Сурагчийн нэр, № эсвэл утсаар хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterMode === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Бүгд ({students.length})
              </button>
              <button
                onClick={() => setFilterMode('logged_in')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterMode === 'logged_in' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Нэвтэрсэн ({loggedInCount})
              </button>
              <button
                onClick={() => setFilterMode('today')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterMode === 'today' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Өнөөдөр ({todayCount})
              </button>
              <button
                onClick={() => setFilterMode('not_logged_in')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterMode === 'not_logged_in' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ороогүй ({notLoggedInCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-blue-50 text-blue-900 border-b border-blue-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 font-bold w-12 text-center">№</th>
                  <th className="py-2.5 px-3 font-bold min-w-[150px]">Сурагч</th>
                  <th className="py-2.5 px-3 font-bold min-w-[130px]">Нэвтрэлтийн төлөв</th>
                  <th className="py-2.5 px-3 font-bold min-w-[130px]">Сүүлд орсон</th>
                  <th className="py-2.5 px-3 font-bold text-center w-20">Удаа</th>
                  <th className="py-2.5 px-3 font-bold min-w-[130px]">Утас & Нэр</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Тохирох сурагч олдсонгүй.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.student.id}
                      className={`transition-colors ${
                        row.hasLoggedIn ? 'hover:bg-emerald-50/20' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500 tabular-nums">
                        {row.student.rollNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectStudent(row.student)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors"
                        >
                          {row.student.lastName} {row.student.firstName}
                        </button>
                        <div className="text-[10px] font-mono text-slate-400">{row.student.id}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        {row.hasLoggedIn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Нэвтэрсэн</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-semibold text-[11px]">
                            <UserX className="w-3 h-3 text-slate-400" />
                            <span>Ороогүй</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums">
                        {row.lastLoginAt ? (
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-semibold">{row.lastLoginAt}</span>
                            {row.loggedInToday && (
                              <span className="text-[10px] font-sans font-bold text-blue-700">Өнөөдөр орсон</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans italic">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 tabular-nums">
                        {row.loginCount > 0 ? `${row.loginCount}` : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        {row.phone ? (
                          <div className="flex items-center gap-1 font-mono font-bold text-blue-700">
                            <Phone className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{row.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Утасгүй</span>
                        )}
                        {row.username && (
                          <div className="text-[10px] font-mono text-slate-500">{row.username}</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Login Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-blue-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Нэвтрэлтийн түүх</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Хүүхдүүд орж ирэх бүрт энд шууд бүртгэгдэнэ
              </p>
            </div>
            <span className="px-2 py-0.5 bg-white border border-blue-200 rounded-lg font-mono text-[11px] font-bold text-blue-700">
              {recentEvents.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
            {recentEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <LogIn className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">Одоогоор сурагчийн нэвтрэлтийн түүх алга байна.</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Сурагчид өөрсдийн нэр болон утсаар бүртгүүлж эсвэл нэвтэрч ороход энд цаг хугацаатайгаа шууд харагдана.
                </p>
              </div>
            ) : (
              recentEvents.map((ev) => (
                <div key={ev.id} className="p-3.5 hover:bg-slate-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-mono font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        {ev.rollNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {ev.studentName}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 inline-flex items-center gap-1 ${
                        ev.action === 'register'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {ev.action === 'register' ? (
                        <>
                          <UserPlus className="w-2.5 h-2.5" />
                          <span>Шинээр бүртгүүлсэн</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-2.5 h-2.5" />
                          <span>Нэвтэрсэн</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pl-8">
                    <span className="font-mono">{ev.timestamp}</span>
                    {ev.phone && (
                      <span className="font-mono text-blue-700 font-semibold">{ev.phone}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
