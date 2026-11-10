import React, { useState, useEffect } from 'react';
import { X, Smartphone, Apple, Play, Download, CheckCircle2, QrCode } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'play' | 'appstore'>('play');
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Simulate fast download / install
      setInstalled(true);
      setTimeout(() => setInstalled(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-blue-200">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-blue-200 hover:text-white rounded-xl hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Мобайл аппликейшн татах
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            ClassPulse - 12Б анги
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Google Play Store болон Apple App Store-оос утсан дээрээ суулгаж, офлайн үед ч ирц, гэрийн даалгавраа хянаарай.
          </p>

          {/* Platform Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-blue-800/60 rounded-xl text-xs font-bold">
            <button
              onClick={() => setPlatform('play')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                platform === 'play'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-current text-emerald-500" />
              Google Play Store
            </button>
            <button
              onClick={() => setPlatform('appstore')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                platform === 'appstore'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Apple className="w-4 h-4 fill-current" />
              Apple App Store
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 text-xs space-y-5">
          {installed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Апп амжилттай суулгагдлаа! Таны утасны нүүр дэлгэцэнд 12Б ангийн апп нэмэгдсэн байна.</span>
            </div>
          )}

          {platform === 'play' ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  12Б
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    ClassPulse: 12Б Сургууль 13
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Хөгжүүлэгч: Нийслэлийн 13-р сургууль · Үнэлгээ: 5.0 ★
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                      Баталгаажсан PWA
                    </span>
                    <span className="text-[10px] text-slate-400">Хэмжээ: 3.2 MB</span>
                  </div>
                </div>
              </div>

              {/* Install button */}
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Google Play-с шууд суулгах / APK татах
              </button>

              <div className="text-[11px] text-slate-500 bg-blue-50/60 p-3 rounded-xl border border-blue-100 leading-relaxed">
                <strong>Android заавар:</strong> Та дээрх товчийг дарснаар таны утсанд албан ёсны WebAPK хэлбэрээр сууж, интернетгүй үед ч гэрийн даалгавар, 7 цагийн ирцийн хуваарь ажиллана.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Apple className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    ClassPulse 12B - iOS App
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Apple iOS 15.0+ (iPhone & iPad дэмжинэ)
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                    App Store PWA Standalone
                  </span>
                </div>
              </div>

              {/* iOS instructions */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-900">iPhone / iPad дээр суулгах заавар:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  <li>Safari хөтөч дээр доод талын <strong>Хуваалцах (Share)</strong> товчийг дарна.</li>
                  <li>Доош гүйлгэж <strong>"Нүүр дэлгэцэнд нэмэх" (Add to Home Screen)</strong> сонголтыг сонгоно.</li>
                  <li>Баруун дээд буланд байрлах <strong>"Нэмэх" (Add)</strong> товчийг дарна.</li>
                </ol>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Apple className="w-4 h-4 fill-current" />
                App Store холбоосыг нээх
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
