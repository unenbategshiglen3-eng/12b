import React, { useState } from 'react';
import { UserAccount, Student } from '../types';
import { ADMIN_ACCESS_CODE, ADMIN_BACKUP_CODE } from '../utils/storage';
import { X, LogIn, UserPlus, Shield, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserAccount[];
  students: Student[];
  onLogin: (account: UserAccount) => void;
  onRegisterStudent: (newAccount: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  accounts,
  students,
  onLogin,
  onRegisterStudent,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state (for 34 students)
  const [selectedRoll, setSelectedRoll] = useState<number>(1);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedInput = loginUsername.trim();
    const upperInput = trimmedInput.toUpperCase();

    // Check special admin code
    if (upperInput === ADMIN_ACCESS_CODE || upperInput === ADMIN_BACKUP_CODE) {
      const adminAcc = accounts.find((a) => a.role === 'admin') || {
        id: 'usr-admin-main',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        displayName: 'Ангийн багш (Администратор)',
        createdAt: '2026-09-01',
      };
      onLogin(adminAcc);
      onClose();
      return;
    }

    const account = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === trimmedInput.toLowerCase() ||
        (acc.rollNumber && String(acc.rollNumber) === trimmedInput) ||
        (acc.parentPhone && acc.parentPhone.replace(/\D/g, '') === trimmedInput.replace(/\D/g, ''))
    );

    if (!account) {
      setLoginError('Хэрэглэгчийн нэр, утас эсвэл сурагчийн дугаар олдсонгүй.');
      return;
    }

    // Allow special admin code as password for admin account
    if (account.role === 'admin' && (loginPassword.toUpperCase() === ADMIN_ACCESS_CODE || loginPassword === ADMIN_BACKUP_CODE)) {
      onLogin(account);
      onClose();
      return;
    }

    if (account.password !== loginPassword) {
      setLoginError('Нууц үг буруу байна.');
      return;
    }

    onLogin(account);
    onClose();
  };

  // Handle Student Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    const student = students.find((s) => s.rollNumber === selectedRoll);
    if (!student) {
      setRegisterError('Сурагч сонгогдоогүй байна.');
      return;
    }

    // Check if roll number already has an account
    const existingRollAccount = accounts.find((acc) => acc.rollNumber === selectedRoll);
    if (existingRollAccount) {
      setRegisterError(`#${selectedRoll} дугаартай ${student.lastName} ${student.firstName} аль хэдийн бүртгэлтэй байна. Нэвтрэх хэсгээр нэвтэрнэ үү.`);
      return;
    }

    const finalUsername = registerUsername.trim() || `student${selectedRoll}`;

    // Check if username taken
    const existingUsername = accounts.find((acc) => acc.username.toLowerCase() === finalUsername.toLowerCase());
    if (existingUsername) {
      setRegisterError(`"${finalUsername}" нэртэй хэрэглэгч аль хэдийн бүртгэгдсэн байна. Өөр нэр сонгоно уу.`);
      return;
    }

    if (registerPassword.length < 3) {
      setRegisterError('Нууц үг доод тал нь 3 тэмдэгттэй байх ёстой.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Нууц үгийн баталгаажуулалт таарахгүй байна.');
      return;
    }

    const newAccount: UserAccount = {
      id: `usr-student-${selectedRoll}-${Date.now()}`,
      username: finalUsername,
      password: registerPassword,
      role: 'student',
      studentId: student.id,
      rollNumber: student.rollNumber,
      displayName: `${student.lastName} ${student.firstName}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onRegisterStudent(newAccount);
    setRegisterSuccess(`Амжилттай бүртгэгдлээ! Тавтай морил, ${newAccount.displayName}`);
    setTimeout(() => {
      onLogin(newAccount);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-blue-200">
        {/* Blue Highlight Header */}
        <div className="bg-blue-600 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Нэвтрэх & Бүртгэлийн систем
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            10-р ангийн удирдлагын портал
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            34 сурагч өөрсдийн бүртгэлээр нэвтэрч мэдээллээ харах ба администратор бүх эрхийг удирдана.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-blue-700/60 rounded-xl text-xs font-medium">
            <button
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Нэвтрэх
            </button>
            <button
              onClick={() => {
                setMode('register');
                setRegisterError('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Сурагчийн бүртгэл үүсгэх
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 text-xs space-y-4">
          {/* Notice on Role-Based Access highlighted in Blue */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">Анхаар:</span> Ирц болон дүрэмт хувцасны мэдээллийг зөвхөн <span className="font-bold text-blue-700 underline">Администратор</span> өөрчлөх эрхтэй. Сурагчид зөвхөн өөрийн мэдээллээ харна.
            </div>
          </div>

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Хэрэглэгчийн нэр эсвэл Сурагчийн дугаар (#1-34)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Жишээ: admin эсвэл 1 (Бат-Эрдэнэ)"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Нууц үг
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Нууц үгээ оруулна уу"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Системд нэвтрэх
              </button>
            </form>
          )}

          {/* MODE 2: REGISTER STUDENT ACCOUNT */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {registerError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}
              {registerSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              {/* Select from 34 students */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Та 34 сурагчийн хэн нь вэ? (Нэрээ сонгоно уу):
                </label>
                <select
                  value={selectedRoll}
                  onChange={(e) => {
                    const r = parseInt(e.target.value);
                    setSelectedRoll(r);
                    setRegisterUsername(`student${r}`);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
                >
                  {students.map((stu) => {
                    const isRegistered = accounts.some((a) => a.rollNumber === stu.rollNumber);
                    return (
                      <option key={stu.id} value={stu.rollNumber}>
                        №{stu.rollNumber} - {stu.lastName} {stu.firstName} ({stu.id}) {isRegistered ? '✓ [Бүртгэлтэй]' : ''}
                      </option>
                    );
                  })}
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Ангийн 34 сурагч тус бүр өөрийн нэр дээр нэг удаа бүртгэл үүсгэнэ.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Хэрэглэгчийн нэр (Нэвтрэх нэр)
                </label>
                <input
                  type="text"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder={`student${selectedRoll}`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Шинэ нууц үг
                  </label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Нууц үг зохиох"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Нууц үг давтах
                  </label>
                  <input
                    type="password"
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Дахин оруулах"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Сурагчийн бүртгэл үүсгэж нэвтрэх
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
