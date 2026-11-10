import React, { useState } from 'react';
import { ClassroomConfig } from '../types';
import { X, CheckCircle2, School, Save } from 'lucide-react';

interface EditClassInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClassroomConfig;
  onSaveConfig: (updatedConfig: ClassroomConfig) => void;
}

export const EditClassInfoModal: React.FC<EditClassInfoModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [className, setClassName] = useState(config.className);
  const [adminName, setAdminName] = useState(config.adminName);
  const [roomNumber, setRoomNumber] = useState(config.roomNumber);
  const [academicYear, setAcademicYear] = useState(config.academicYear);
  const [grade, setGrade] = useState(config.grade);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      schoolName: schoolName.trim(),
      className: className.trim(),
      adminName: adminName.trim(),
      roomNumber: roomNumber.trim(),
      academicYear: academicYear.trim(),
      grade: grade.trim(),
    });
    onClose();
  };

  const handleResetToDefault = () => {
    setSchoolName('Нийслэлийн 13-р сургууль');
    setClassName('12Б анги');
    setAdminName('Ангийн багш (Администратор)');
    setRoomNumber('302 тоот танхим');
    setAcademicYear('2026-2027 хичээлийн жил');
    setGrade('12-р анги');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-blue-200">
        {/* Header */}
        <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="text-base font-bold">Сургууль & Ангийн мэдээлэл засах</h3>
              <p className="text-xs text-blue-100">Бүх системд харагдах үндсэн мэдээлэл</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Сургуулийн нэр (Default: Нийслэлийн 13-р сургууль)
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ангийн нэр (Default: 12Б анги)
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ангийн түвшин
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ангийн багш
            </label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Танхим / Өрөөний дугаар
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Хичээлийн жил
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] text-blue-600 hover:underline font-semibold"
            >
              Үндсэн хэвэнд оруулах (13-р сургууль, 12Б)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Болих
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Хадгалах
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
