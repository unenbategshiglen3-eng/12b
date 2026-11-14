import React, { useState } from 'react';
import { X, Smartphone, Download, CheckCircle2, Wifi, WifiOff, Share, MoreVertical, HardDriveDownload } from 'lucide-react';
import { PWAInstallState } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { downloadFile } from '../utils/storage';
import { getTodayDateString } from '../utils/dateUtils';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  pwaInstall: PWAInstallState;
  onExportBackup?: () => string;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  pwaInstall,
  onExportBackup,
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>(pwaInstall.isIOS ? 'ios' : 'android');
  const [installFeedback, setInstallFeedback] = useState<'accepted' | 'manual' | null>(null);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const isOnline = useOnlineStatus();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const outcome = await pwaInstall.promptInstall();
    if (outcome === 'accepted') {
      setInstallFeedback('accepted');
    } else if (outcome === 'unavailable') {
      setInstallFeedback('manual');
    }
  };

  const handleDownloadBackup = () => {
    if (!onExportBackup) return;
    const json = onExportBackup();
    downloadFile(`12B_Angi_Noots_${getTodayDateString()}.json`, json, 'application/json;charset=utf-8;');
    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-blue-200">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Хаах"
            className="absolute right-4 top-4 p-1.5 text-blue-200 hover:text-white rounded-xl hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
            PWA Аппликейшн суулгах & Офлайн горим
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            ClassPulse — 12Б анги
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Гар утас (Android / iPhone) болон компьютер дээр тусдаа апп болгон суулгаж, интернэтгүй үед ч ирц болон түүхээ ашиглана уу.
          </p>

          {/* Platform Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-blue-800/60 rounded-xl text-xs font-bold">
            <button
              onClick={() => setPlatform('android')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                platform === 'android'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Android / Компьютер
            </button>
            <button
              onClick={() => setPlatform('ios')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                platform === 'ios'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Share className="w-4 h-4" />
              iPhone / iPad (iOS)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 text-xs space-y-4">
          {/* App Card + Live Status */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <img
                src="/pwa-192x192.png"
                alt="12Б Анги"
                className="w-14 h-14 rounded-2xl shadow-sm border border-blue-200 shrink-0"
              />
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Нийслэлийн 13-р сургууль · 12Б
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                    PWA Бэлэн
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-600" />
                        Онлайн
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-600" />
                        Офлайн бэлэн
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(pwaInstall.isInstalled || installFeedback === 'accepted') && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Апп таны төхөөрөмжид суусан байна! Нүүр дэлгэцээсээ шууд нээх боломжтой.</span>
            </div>
          )}

          {platform === 'android' ? (
            <div className="space-y-3">
              {pwaInstall.isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Төхөөрөмжид шууд суулгах (App Install)
                </button>
              ) : (
                !pwaInstall.isInstalled && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                    <div className="font-bold text-blue-950 flex items-center gap-1.5">
                      <MoreVertical className="w-4 h-4 text-blue-600" />
                      Chrome / Edge дээр суулгах заавар:
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                      <li>
                        Хөтчийн хаягийн мөрний баруун талын <strong>Суулгах (Install)</strong> дүрс эсвэл <strong>⋮ цэс</strong> дээр дарна.
                      </li>
                      <li>
                        <strong>"Апп суулгах" (Install app)</strong> эсвэл <strong>"Нүүр дэлгэцэнд нэмэх" (Add to Home screen)</strong> сонголтыг дарна.
                      </li>
                      <li>
                        Суусны дараа утас болон компьютер дээрээ энгийн апп шиг нээж, офлайн ашиглана.
                      </li>
                    </ol>
                  </div>
                )
              )}

              {installFeedback === 'manual' && !pwaInstall.isInstallable && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px]">
                  Дээрх хөтчийн цэснээс <strong>"Апп суулгах / Add to Home screen"</strong> сонголтыг ашиглан суулгаарай.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Share className="w-4 h-4 text-blue-600" />
                iPhone / iPad (Safari) дээр суулгах заавар:
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                <li>
                  <strong>Safari</strong> хөтөч дээр энэ хуудсыг нээж доод талын <strong>Хуваалцах (Share)</strong> товчийг дарна.
                </li>
                <li>
                  Доош гүйлгэж <strong>"Нүүр дэлгэцэнд нэмэх" (Add to Home Screen)</strong> сонголтыг дарна.
                </li>
                <li>
                  Баруун дээд буланд байрлах <strong>"Нэмэх" (Add)</strong> товчийг дарснаар апп шууд сууна.
                </li>
              </ol>
            </div>
          )}

          {/* Local Data Backup Export */}
          {onExportBackup && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Ангийн бүх түүх, сурагчид, хуваарийг файлаар хадгалж авах:
              </div>
              <button
                onClick={handleDownloadBackup}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <HardDriveDownload className="w-3.5 h-3.5 text-blue-600" />
                {backupDownloaded ? 'Татагдлаа ✓' : 'Нөөц татах (JSON)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
