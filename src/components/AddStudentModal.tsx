import React, { useState } from 'react';
import { Student } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { X, UserPlus } from 'lucide-react';

interface AddStudentModalProps {
  currentCount: number;
  onClose: () => void;
  onAddStudent: (newStudent: Student) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  currentCount,
  onClose,
  onAddStudent,
}) => {
  const nextRoll = currentCount + 1;
  const nextId = `STU-${String(nextRoll).padStart(3, '0')}`;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2010-05-15');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation] = useState<'Аав' | 'Ээж' | 'Асран хамгаалагч'>('Аав');
  const [guardianPhone, setGuardianPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const student: Student = {
      id: nextId,
      rollNumber: nextRoll,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      email: `student${nextRoll}@school13.edu.mn`,
      phone: guardianPhone.trim(),
      guardianName: guardianName.trim() || 'Асран хамгаалагч',
      guardianRelation,
      guardianPhone: guardianPhone.trim(),
      fatherPhone: guardianPhone.trim(),
      motherPhone: '',
      guardianEmail: `parent${nextRoll}@mail.mn`,
      address: `Улаанбаатар хот, Баянзүрх дүүрэг, 13-р хороо`,
      emergencyContact: guardianName.trim(),
      bloodGroup: '',
      medicalAlerts: '',
      generalNotes: '12Б ангид шинээр шилжин ирсэн сурагч.',
      tags: ['Шинэ сурагч'],
      accountRegistered: false,
      notesLog: [
        {
          id: `note-${nextId}-1`,
          date: getTodayDateString(),
          author: 'Администратор',
          category: 'Захиргаа',
          content: `12Б ангид албан ёсоор бүртгэв. Жагсаалтын дугаар: #${nextRoll}.`,
        },
      ],
    };

    onAddStudent(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-blue-200">
        <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Шинэ сурагч бүртгэх</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Жагсаалтын дугаар: #{nextRoll} · Сурагчийн код: {nextId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Овог</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Жишээ: Батбаяр"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Нэр</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Жишээ: Анар"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Төрсөн огноо</label>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <span className="font-bold text-blue-900 block">Өөрийн дугаар & Асран хамгаалагч</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Асран хамгаалагчийн нэр"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
              />
              <input
                type="text"
                placeholder="Өөрийн утасны дугаар"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Сурагчийг бүртгэх
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
