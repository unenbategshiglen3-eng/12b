import React, { useState } from 'react';
import { UserAccount, Student, ClassroomConfig } from '../types';
import { ADMIN_ACCESS_CODE, ADMIN_BACKUP_CODE } from '../utils/storage';
import { getTodayDateString } from '../utils/dateUtils';
import { Shield, User, LogIn, UserPlus, Phone, Smartphone, KeyRound, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface WelcomeAuthScreenProps {
  config: ClassroomConfig;
  students: Student[];
  accounts: UserAccount[];
  onLogin: (account: UserAccount) => void;
  onRegisterStudent: (newAccount: UserAccount, parentPhone?: string) => void;
  onOpenDownloadModal: () => void;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({
  config,
  students,
  accounts,
  onLogin,
  onRegisterStudent,
  onOpenDownloadModal,
}) => {
  const [mode, setMode] = useState<'signup' | 'login' | 'admin'>('signup');

  // Sign up state
  const [selectedRoll, setSelectedRoll] = useState<number>(1);
  const [parentPhone, setParentPhone] = useState('');
  const [signupUsername, setSignupUsername] = useState('student1');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin access state
  const [adminAccessCode, setAdminAccessCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const selectedStudent = students.find((s) => s.rollNumber === selectedRoll) || students[0];

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    // Check if account already exists for roll
    const existing = accounts.find((a) => a.rollNumber === selectedRoll);
    if (existing) {
      setSignupError(`#${selectedRoll} дугаартай ${selectedStudent.lastName} ${selectedStudent.firstName} сурагч аль хэдийн бүртгэгдсэн байна. Нэвтрэх хэсгээр орно уу.`);
      return;
    }

    if (signupPassword.length < 3) {
      setSignupError('Нууц үг доод тал нь 3 тэмдэгттэй байх ёстой.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Нууц үгийн баталгаажуулалт таарахгүй байна.');
      return;
    }

    const finalUsername = signupUsername.trim() || `student${selectedRoll}`;

    const newAccount: UserAccount = {
      id: `usr-student-${selectedRoll}-${Date.now()}`,
      username: finalUsername,
      password: signupPassword,
      role: 'student',
      studentId: selectedStudent.id,
      rollNumber: selectedRoll,
      displayName: `${selectedStudent.lastName} ${selectedStudent.firstName}`,
      parentPhone: parentPhone.trim(),
      createdAt: getTodayDateString(),
    };

    onRegisterStudent(newAccount, parentPhone.trim());
    setSignupSuccess(`Амжилттай бүртгэгдлээ! Тавтай морил, ${selectedStudent.firstName}`);
    setTimeout(() => {
      onLogin(newAccount);
    }, 700);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const account = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === loginIdentifier.trim().toLowerCase() ||
        (acc.rollNumber && String(acc.rollNumber) === loginIdentifier.trim()) ||
        (acc.parentPhone && acc.parentPhone.replace(/\D/g, '') === loginIdentifier.replace(/\D/g, ''))
    );

    if (!account) {
      setLoginError('Хэрэглэгчийн нэр, утас эсвэл сурагчийн дугаар олдсонгүй.');
      return;
    }

    if (account.password !== loginPassword) {
      setLoginError('Нууц үг буруу байна.');
      return;
    }

    onLogin(account);
  };

  const handleAdminAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    const trimmedCode = adminAccessCode.trim().toUpperCase();
    const isValidCode = trimmedCode === ADMIN_ACCESS_CODE || trimmedCode === ADMIN_BACKUP_CODE;

    if (!isValidCode) {
      setAdminError('Администраторын тусгай код буруу байна. Зөвхөн эрх бүхий ангийн багш нэвтрэх боломжтой.');
      return;
    }

    // Find or create admin account without mutating existing array item
    const existingAdmin = accounts.find((a) => a.role === 'admin');
    const adminAccount: UserAccount = existingAdmin
      ? {
          ...existingAdmin,
          password: adminPassword && adminPassword.length >= 3 ? adminPassword : existingAdmin.password,
        }
      : {
          id: 'usr-admin-main',
          username: 'admin',
          password: adminPassword || 'admin',
          role: 'admin',
          displayName: config.adminName || 'Ангийн багш (Администратор)',
          createdAt: getTodayDateString(),
        };

    setAdminSuccess('Тусгай код зөв байна! Администраторын эрхээр системд нэвтэрч байна...');
    setTimeout(() => {
      onLogin(adminAccount);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-900 via-blue-950 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-lg border border-blue-400/40">
            12Б
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
              {config.schoolName}
            </div>
            <div className="text-sm font-extrabold text-white">
              {config.className} · {config.adminName || 'Ангийн багш'}
            </div>
          </div>
        </div>

        {/* App Install Badge on Top */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-200" />
            <span>Утас / Компьютерт апп суулгах</span>
          </button>
        </div>
      </div>

      {/* Main Registration & Sign-Up Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-blue-200">
        {/* Card Header in Blue */}
        <div className="bg-blue-600 text-white p-6 relative">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">
            Эхлэх & Нэвтрэх хэсэг
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {config.className}-ийн цахим бүртгэл
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {students.length} сурагч өөрийн дугаараар бүртгүүлэн 5 өдрийн хуваарь, ирц, гэрийн даалгавраа хянана.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-blue-700/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                mode === 'signup'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Бүртгүүлэх
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                mode === 'login'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Нэвтрэх
            </button>
            <button
              onClick={() => setMode('admin')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                mode === 'admin'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Админ код
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 text-xs space-y-4">
          {/* TAB 1: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}
              {signupSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {/* Student Picker */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  1. Та {students.length} сурагчийн хэн нь вэ?
                </label>
                <select
                  value={selectedRoll}
                  onChange={(e) => {
                    const r = parseInt(e.target.value);
                    setSelectedRoll(r);
                    setSignupUsername(`student${r}`);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  {students.map((stu) => {
                    const isReg = accounts.some((a) => a.rollNumber === stu.rollNumber);
                    return (
                      <option key={stu.id} value={stu.rollNumber}>
                        №{stu.rollNumber} - {stu.lastName} {stu.firstName} {isReg ? '✓ [Бүртгэлтэй]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Student Own Phone Number Section */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <label className="block font-bold text-blue-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  2. Өөрийн дугаар:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Өөрийн утасны дугаараа оруулна уу"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-950 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-blue-700 block">
                  Мэдэгдэл болон гэрийн даалгаврын мэдээлэл энэ дугаарт холбогдоно.
                </span>
              </div>

              {/* Username */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Хэрэглэгчийн нэр
                </label>
                <input
                  type="text"
                  required
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Нууц үг</label>
                  <input
                    type="password"
                    required
                    placeholder="3+ тэмдэгт"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Баталгаажуулах</label>
                  <input
                    type="password"
                    required
                    placeholder="Дахин оруулах"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Бүртгэл үүсгэж системд орох
              </button>
            </form>
          )}

          {/* TAB 2: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Хэрэглэгчийн нэр, Өөрийн утас эсвэл Сурагчийн дугаар (#1-{students.length})
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin эсвэл 1 (М. Азжаргал)"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Нууц үг</label>
                <input
                  type="password"
                  required
                  placeholder="Нууц үгээ оруулна уу"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Системд нэвтрэх
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN SPECIAL ACCESS */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminAccessSubmit} className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Администраторын тусгай нэвтрэлт
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Ирц, дүрэмт хувцасны бүртгэлийг удирдахын тулд зөвхөн ангийн багшид олгосон <strong>тусгай нууц код</strong>-оор нэвтэрнэ.
                </p>
              </div>

              {adminError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}
              {adminSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adminSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Администраторын тусгай код (Special Admin Code):
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Тусгай нууц кодоо оруулна уу"
                    value={adminAccessCode}
                    onChange={(e) => setAdminAccessCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-blue-300 rounded-xl text-xs font-mono font-bold text-blue-950 tracking-wider focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Админы нууц үг (Сонголттой):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Хоосон үлдээвэл шууд тусгай кодоор нэвтэрнэ"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Администратороор нэвтрэх
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-5xl w-full mx-auto text-center text-xs text-blue-300/80 py-2">
        {config.schoolName} · {config.className} · Хичээлийн жил: {config.academicYear} · 5 өдрийн 7 цагийн цахим хуваарь
      </div>
    </div>
  );
};
