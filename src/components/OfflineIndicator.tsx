import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-600/30 no-print"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        Офлайн горим идэвхтэй байна — таны бүртгэсэн бүх ирц болон өдрийн түүх төхөөрөмжид найдвартай хадгалагдана.
      </span>
    </div>
  );
};
