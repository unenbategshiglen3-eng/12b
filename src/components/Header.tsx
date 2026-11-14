import React from 'react';
import { ClassroomConfig, UserAccount } from '../types';
import { Shield, User, LogOut, ChevronDown, Edit3, Smartphone, CheckCircle2 } from 'lucide-react';

export type AppTab = 'attendance' | 'history' | 'schedule' | 'uniform' | 'directory' | 'logins' | 'reports';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  config: ClassroomConfig;
  currentUser: UserAccount;
  studentsCount?: number;
  savedDaysCount?: number;
  loggedInStudentsCount?: number;
  isAppInstalled?: boolean;
  isAppInstallable?: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onQuickAction: () => void;
  onOpenEditClassInfo: () => void;
  onOpenDownloadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  config,
  currentUser,
  studentsCount = 34,
  savedDaysCount = 0,
  loggedInStudentsCount = 0,
  isAppInstalled = false,
  isAppInstallable = false,
  onOpenAuthModal,
  onLogout,
  onQuickAction,
  onOpenEditClassInfo,
  onOpenDownloadModal,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-blue-100 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: School and Class Badge with Edit button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-left flex items-center gap-2 group"
            >
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs border border-blue-500">
                12Б
              </span>
              <div className="hidden sm:block">
                <span className="text-sm font-extrabold tracking-tight text-blue-900 group-hover:text-blue-700 block leading-tight">
                  {config.className} · {config.schoolName}
                </span>
                <span className="text-[11px] text-blue-600 font-semibold block leading-tight">
                  {config.adminName} ({studentsCount} сурагч)
                </span>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenEditClassInfo}
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="Сургууль, ангийн мэдээлэл засах"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          {isAdmin ? (
            <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                  activeTab === 'attendance'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                7 цагийн ирц
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                  activeTab === 'history'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Өдрийн түүх ({savedDaysCount})
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                  activeTab === 'schedule'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                5 өдрийн хуваарь
              </button>
              <button
                onClick={() => setActiveTab('uniform')}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                  activeTab === 'uniform'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Дүрэмт хувцас
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                  activeTab === 'directory'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Сурагчид ({studentsCount})
              </button>
              <button
                onClick={() => setActiveTab('logins')}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                  activeTab === 'logins'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Нэвтрэлт ({loggedInStudentsCount}/{studentsCount})
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors ${
                  activeTab === 'reports'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Журнал
              </button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold">
              <span className="text-blue-600 font-bold border-b-2 border-blue-600 py-1.5">
                Сурагчийн хувийн портал (Зөвхөн харах эрх)
              </span>
            </nav>
          )}

          {/* Zone 3: Actions & User capsule */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PWA Install / Download Button */}
            <button
              onClick={onOpenDownloadModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl text-xs font-bold transition-colors shadow-2xs ${
                isAppInstalled
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
              }`}
              title="Апп суулгах & Офлайн бэлэн байдал"
            >
              {isAppInstalled ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="hidden md:inline">
                {isAppInstalled ? 'Апп суусан' : isAppInstallable ? 'Апп суулгах' : 'Апп татах'}
              </span>
            </button>

            {/* User Account Capsule */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-colors"
              title="Данс солих"
            >
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <User className="w-3.5 h-3.5 text-blue-600" />
              )}
              <div className="text-left hidden sm:block">
                <span className="font-bold text-slate-800 block truncate max-w-[130px]">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] text-blue-600 block">
                  {isAdmin ? 'Админ' : 'Сурагч'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isAdmin && (
              <button
                onClick={onQuickAction}
                className="hidden xl:flex px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                + Сурагч
              </button>
            )}

            {/* Logout button to return to registration/sign-up screen */}
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Системээс гарах (Эхлэл хэсэг рүү очих)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {isAdmin && (
        <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs font-semibold gap-2 text-slate-600">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${activeTab === 'attendance' ? 'bg-blue-600 text-white font-bold' : ''}`}
          >
            7 цагийн ирц
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${activeTab === 'history' ? 'bg-blue-600 text-white font-bold' : ''}`}
          >
            Түүх ({savedDaysCount})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${activeTab === 'schedule' ? 'bg-blue-600 text-white font-bold' : ''}`}
          >
            5 өдрийн хуваарь
          </button>
          <button
            onClick={() => setActiveTab('uniform')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${activeTab === 'uniform' ? 'bg-blue-600 text-white font-bold' : ''}`}
          >
            Дүрэмт хувцас
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${activeTab === 'directory' ? 'bg-blue-600 text-white font-bold' : ''}`}
          >
            Сурагчид ({studentsCount})
          </button>
          <button
            onClick={() => setActiveTab('logins')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${activeTab === 'logins' ? 'bg-blue-600 text-white font-bold' : ''}`}
          >
            Нэвтрэлт ({loggedInStudentsCount}/{studentsCount})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${activeTab === 'reports' ? 'bg-blue-600 text-white font-bold' : ''}`}
          >
            Журнал
          </button>
        </div>
      )}
    </header>
  );
};

