import {
  Student,
  PeriodInfo,
  ClassroomConfig,
  DailyClassLog,
  AttendanceStatus,
  UniformStatus,
  WeekdayName,
  HomeworkItem,
} from '../types';

export const WEEKDAYS: WeekdayName[] = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан'];

export const DEFAULT_PERIODS: PeriodInfo[] = [
  { periodNumber: 1, name: '1-р цаг', subject: 'Математик', timeSlot: '08:00 - 08:45', room: '302 тоот', teacher: 'Д. Батбаяр' },
  { periodNumber: 2, name: '2-р цаг', subject: 'Монгол хэл, Уран зохиол', timeSlot: '08:55 - 09:40', room: '108 тоот', teacher: 'С. Цэцэгмаа' },
  { periodNumber: 3, name: '3-р цаг', subject: 'Физик', timeSlot: '09:50 - 10:35', room: 'Физикийн лаб', teacher: 'Г. Болд' },
  { periodNumber: 4, name: '4-р цаг', subject: 'Түүх, Нийгэм', timeSlot: '10:55 - 11:40', room: '215 тоот', teacher: 'Ж. Баярмаа' },
  { periodNumber: 5, name: '5-р цаг', subject: 'Англи хэл', timeSlot: '12:30 - 13:15', room: '112 тоот', teacher: 'П. Саруул' },
  { periodNumber: 6, name: '6-р цаг', subject: 'Мэдээлэл зүй', timeSlot: '13:25 - 14:10', room: 'Компьютерийн лаб', teacher: 'Б. Тэмүүлэн' },
  { periodNumber: 7, name: '7-р цаг', subject: 'Биеийн тамир', timeSlot: '14:20 - 15:05', room: 'Спорт заал', teacher: 'Э. Мөнх-Эрдэнэ' },
];

export const DEFAULT_WEEKLY_TIMETABLE: Record<WeekdayName, PeriodInfo[]> = {
  Даваа: [
    { periodNumber: 1, name: '1-р цаг', subject: 'Математик', timeSlot: '08:00 - 08:45', room: '302 тоот', teacher: 'Д. Батбаяр' },
    { periodNumber: 2, name: '2-р цаг', subject: 'Монгол хэл', timeSlot: '08:55 - 09:40', room: '108 тоот', teacher: 'С. Цэцэгмаа' },
    { periodNumber: 3, name: '3-р цаг', subject: 'Физик', timeSlot: '09:50 - 10:35', room: 'Физикийн лаб', teacher: 'Г. Болд' },
    { periodNumber: 4, name: '4-р цаг', subject: 'Түүх', timeSlot: '10:55 - 11:40', room: '215 тоот', teacher: 'Ж. Баярмаа' },
    { periodNumber: 5, name: '5-р цаг', subject: 'Англи хэл', timeSlot: '12:30 - 13:15', room: '112 тоот', teacher: 'П. Саруул' },
    { periodNumber: 6, name: '6-р цаг', subject: 'Мэдээлэл зүй', timeSlot: '13:25 - 14:10', room: 'Компьютерийн лаб', teacher: 'Б. Тэмүүлэн' },
    { periodNumber: 7, name: '7-р цаг', subject: 'Биеийн тамир', timeSlot: '14:20 - 15:05', room: 'Спорт заал', teacher: 'Э. Мөнх-Эрдэнэ' },
  ],
  Мягмар: [
    { periodNumber: 1, name: '1-р цаг', subject: 'Хими', timeSlot: '08:00 - 08:45', room: 'Химийн лаб', teacher: 'Н. Батцэцэг' },
    { periodNumber: 2, name: '2-р цаг', subject: 'Уран зохиол', timeSlot: '08:55 - 09:40', room: '108 тоот', teacher: 'С. Цэцэгмаа' },
    { periodNumber: 3, name: '3-р цаг', subject: 'Геометр', timeSlot: '09:50 - 10:35', room: '302 тоот', teacher: 'Д. Батбаяр' },
    { periodNumber: 4, name: '4-р цаг', subject: 'Англи хэл', timeSlot: '10:55 - 11:40', room: '112 тоот', teacher: 'П. Саруул' },
    { periodNumber: 5, name: '5-р цаг', subject: 'Нийгэм судлал', timeSlot: '12:30 - 13:15', room: '215 тоот', teacher: 'Ж. Баярмаа' },
    { periodNumber: 6, name: '6-р цаг', subject: 'Газарзүй', timeSlot: '13:25 - 14:10', room: '206 тоот', teacher: 'Ц. Өлзий' },
    { periodNumber: 7, name: '7-р цаг', subject: 'Сонгон шалгаруулалт', timeSlot: '14:20 - 15:05', room: '302 тоот', teacher: 'Ангийн багш' },
  ],
  Лхагва: [
    { periodNumber: 1, name: '1-р цаг', subject: 'Алгебр', timeSlot: '08:00 - 08:45', room: '302 тоот', teacher: 'Д. Батбаяр' },
    { periodNumber: 2, name: '2-р цаг', subject: 'Биологи', timeSlot: '08:55 - 09:40', room: 'Биологийн лаб', teacher: 'Л. Энхмаа' },
    { periodNumber: 3, name: '3-р цаг', subject: 'Монгол бичиг', timeSlot: '09:50 - 10:35', room: '108 тоот', teacher: 'С. Цэцэгмаа' },
    { periodNumber: 4, name: '4-р цаг', subject: 'Физик', timeSlot: '10:55 - 11:40', room: 'Физикийн лаб', teacher: 'Г. Болд' },
    { periodNumber: 5, name: '5-р цаг', subject: 'Мэдээллийн технологи', timeSlot: '12:30 - 13:15', room: 'Компьютерийн лаб', teacher: 'Б. Тэмүүлэн' },
    { periodNumber: 6, name: '6-р цаг', subject: 'Түүх', timeSlot: '13:25 - 14:10', room: '215 тоот', teacher: 'Ж. Баярмаа' },
    { periodNumber: 7, name: '7-р цаг', subject: 'Эрүүл мэнд', timeSlot: '14:20 - 15:05', room: 'Эмчийн өрөө', teacher: 'Б. Сарантуяа' },
  ],
  Пүрэв: [
    { periodNumber: 1, name: '1-р цаг', subject: 'Англи хэл', timeSlot: '08:00 - 08:45', room: '112 тоот', teacher: 'П. Саруул' },
    { periodNumber: 2, name: '2-р цаг', subject: 'Математик', timeSlot: '08:55 - 09:40', room: '302 тоот', teacher: 'Д. Батбаяр' },
    { periodNumber: 3, name: '3-р цаг', subject: 'Нийгэм', timeSlot: '09:50 - 10:35', room: '215 тоот', teacher: 'Ж. Баярмаа' },
    { periodNumber: 4, name: '4-р цаг', subject: 'Хими', timeSlot: '10:55 - 11:40', room: 'Химийн лаб', teacher: 'Н. Батцэцэг' },
    { periodNumber: 5, name: '5-р цаг', subject: 'Уран зохиол', timeSlot: '12:30 - 13:15', room: '108 тоот', teacher: 'С. Цэцэгмаа' },
    { periodNumber: 6, name: '6-р цаг', subject: 'Дизайн технологи', timeSlot: '13:25 - 14:10', room: 'Урлан', teacher: 'Ч. Гансүх' },
    { periodNumber: 7, name: '7-р цаг', subject: 'Биеийн тамир', timeSlot: '14:20 - 15:05', room: 'Спорт заал', teacher: 'Э. Мөнх-Эрдэнэ' },
  ],
  Баасан: [
    { periodNumber: 1, name: '1-р цаг', subject: 'Физик', timeSlot: '08:00 - 08:45', room: 'Физикийн лаб', teacher: 'Г. Болд' },
    { periodNumber: 2, name: '2-р цаг', subject: 'Алгебр', timeSlot: '08:55 - 09:40', room: '302 тоот', teacher: 'Д. Батбаяр' },
    { periodNumber: 3, name: '3-р цаг', subject: 'Монгол хэл', timeSlot: '09:50 - 10:35', room: '108 тоот', teacher: 'С. Цэцэгмаа' },
    { periodNumber: 4, name: '4-р цаг', subject: 'Англи хэл', timeSlot: '10:55 - 11:40', room: '112 тоот', teacher: 'П. Саруул' },
    { periodNumber: 5, name: '5-р цаг', subject: 'Биологи', timeSlot: '12:30 - 13:15', room: 'Биологийн лаб', teacher: 'Л. Энхмаа' },
    { periodNumber: 6, name: '6-р цаг', subject: 'Ангийн цаг', timeSlot: '13:25 - 14:10', room: '302 тоот', teacher: 'Ангийн багш' },
    { periodNumber: 7, name: '7-р цаг', subject: 'Клуб, секц', timeSlot: '14:20 - 15:05', room: 'Акт заал', teacher: 'Чөлөөт сонголт' },
  ],
};

export const DEFAULT_CONFIG: ClassroomConfig = {
  className: '12Б анги',
  grade: '12-р анги',
  academicYear: '2026-2027 хичээлийн жил',
  roomNumber: '302 тоот танхим',
  adminName: 'Ангийн багш (Администратор)',
  schoolName: 'Нийслэлийн 13-р сургууль',
  periods: DEFAULT_PERIODS,
  weeklyTimetable: DEFAULT_WEEKLY_TIMETABLE,
};

export const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    subject: 'Математик',
    title: 'Интеграл болон уламжлалын бодлогууд',
    description: 'Сурах бичгийн 84-р хуудасны 1-ээс 10 хүртэлх бодлогыг дэвтэрт бүрэн бодож ирэх.',
    weekday: 'Даваа',
    periodNumber: 1,
    dueDate: '2026-11-10',
    dueTime: '08:00',
    priority: 'Яаралтай',
    assignedDate: '2026-11-09',
    teacherName: 'Д. Батбаяр',
    completedBy: ['STU-001', 'STU-002', 'STU-004'],
  },
  {
    id: 'hw-2',
    subject: 'Монгол хэл, Уран зохиол',
    title: '"Тунгалаг тамир" романы дүрийн шинжилгээ',
    description: 'Итгэлт болон Эрдэнийн дүрийн харьцуулсан 300 үгтэй эссэ бичих.',
    weekday: 'Даваа',
    periodNumber: 2,
    dueDate: '2026-11-11',
    dueTime: '08:55',
    priority: 'Чухал',
    assignedDate: '2026-11-09',
    teacherName: 'С. Цэцэгмаа',
    completedBy: ['STU-001'],
  },
  {
    id: 'hw-3',
    subject: 'Физик',
    title: 'Цахилгаан соронзон орны лабораторийн тайлан',
    description: '3-р лабораторийн ажлын тооцоог графикийн цаасан дээр зурж дүгнэлт бичих.',
    weekday: 'Лхагва',
    periodNumber: 4,
    dueDate: '2026-11-12',
    dueTime: '10:55',
    priority: 'Энгийн',
    assignedDate: '2026-11-09',
    teacherName: 'Г. Болд',
    completedBy: [],
  },
  {
    id: 'hw-4',
    subject: 'Англи хэл',
    title: 'IELTS Writing Task 2 эссэ бэлтгэл',
    description: 'Technology in Education сэдвээр 250 үгтэй formal essay бичих.',
    weekday: 'Пүрэв',
    periodNumber: 1,
    dueDate: '2026-11-13',
    dueTime: '08:00',
    priority: 'Чухал',
    assignedDate: '2026-11-09',
    teacherName: 'П. Саруул',
    completedBy: ['STU-002'],
  },
];

// Official 34 students from 12б АНГИ roster image (phone numbers start empty so users enter their own number)
const MONGOLIAN_34_STUDENTS = [
  { roll: 1, first: 'Азжаргал', last: 'М.', gender: 'Эмэгтэй' as const, dob: '2009-03-14', guardian: 'М. Мөнхболд', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Хөнгөн харшилтай', notes: 'Идэвхтэй сурагч.', tags: ['Спорт', 'Мэтгэлцээн'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 2, first: 'Ариунбаатар', last: 'Х.', gender: 'Эрэгтэй' as const, dob: '2009-06-22', guardian: 'Х. Хүрэлбаатар', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Харшилгүй', notes: 'Нямбай сурагч.', tags: ['Урлаг', 'Эко клуб'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 3, first: 'Батбаатар', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-01-19', guardian: 'Б. Бат-Очир', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Самарны харшилтай', notes: 'Хөлбөмбөгөөр хичээллэдэг.', tags: ['Хөлбөмбөг', 'Спорт'], paid: 900000, total: 1450000, dueDate: '2026-11-20' },
  { roll: 4, first: 'Бат-Үнэн', last: 'Э.', gender: 'Эрэгтэй' as const, dob: '2009-08-05', guardian: 'Э. Энхболд', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Харааны шил зүүдэг', notes: 'Сургуулийн сонины гишүүн.', tags: ['Уран зохиол'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 5, first: 'Баярмандах', last: 'Д.', gender: 'Эрэгтэй' as const, dob: '2009-04-11', guardian: 'Д. Даваахүү', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Цагаан идээний харшилтай', notes: 'Програмчлал сонирхдог.', tags: ['Компьютер'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 6, first: 'Билгүүн', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-09-30', guardian: 'Б. Батсүх', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Тоосны харшилтай', notes: 'Зураг зурдаг.', tags: ['Урлаг', 'Зураг'], paid: 500000, total: 1450000, dueDate: '2026-11-05' },
  { roll: 7, first: 'Билгүүнболд', last: 'М.', gender: 'Эрэгтэй' as const, dob: '2009-11-17', guardian: 'М. Мөнхбаяр', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Хөнгөн атлетик.', tags: ['Атлетик', 'Спорт'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 8, first: 'Болорхүү', last: 'З.', gender: 'Эрэгтэй' as const, dob: '2009-02-14', guardian: 'З. Зоригт', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Харшилгүй', notes: 'Хичээнгүй.', tags: ['Спорт'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 9, first: 'Дүүрэнбилэг', last: 'М.', gender: 'Эрэгтэй' as const, dob: '2009-07-09', guardian: 'М. Мягмардорж', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Эко клубийн гишүүн.', tags: ['Эко клуб'], paid: 0, total: 1450000, dueDate: '2026-10-31' },
  { roll: 10, first: 'Дэлгэрзаяа', last: 'Э.', gender: 'Эмэгтэй' as const, dob: '2009-12-03', guardian: 'Э. Энхтуул', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Эхний ширээнд суудаг', notes: 'Түүхийн хичээлд дуртай.', tags: ['Номын санч'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 11, first: 'Дэнсмаа', last: 'Г.', gender: 'Эмэгтэй' as const, dob: '2009-05-27', guardian: 'Г. Гантуяа', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Сагсан бөмбөгийн баг.', tags: ['Сагсан бөмбөг', 'Спорт'], paid: 1000000, total: 1450000, dueDate: '2026-11-25' },
  { roll: 12, first: 'Ирмүүн', last: 'А.', gender: 'Эрэгтэй' as const, dob: '2009-10-15', guardian: 'А. Алтансүх', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Самарны харшилтай', notes: 'Илтгэх урлаг.', tags: ['Илтгэгч', 'Мэтгэлцээн'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 13, first: 'Мөнгөншагай', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-03-08', guardian: 'Б. Батболд', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Хийл хөгжим тоглодог.', tags: ['Хөгжим'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 14, first: 'Мөнх-Ану', last: 'М.', gender: 'Эмэгтэй' as const, dob: '2009-08-19', guardian: 'М. Мөнхтуяа', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Номын сангийн туслах.', tags: ['Номын санч'], paid: 725000, total: 1450000, dueDate: '2026-11-20' },
  { roll: 15, first: 'Мөнхгэрэл', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-06-01', guardian: 'Б. Батчулуун', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Харшилгүй', notes: 'Физикт авьяастай.', tags: ['Физик'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 16, first: 'Мөнх-Очир', last: 'Л.', gender: 'Эрэгтэй' as const, dob: '2009-01-25', guardian: 'Л. Лхагвасүрэн', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Хичээнгүй сурагч.', tags: ['Уран зохиол'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 17, first: 'Намуун', last: 'О.', gender: 'Эмэгтэй' as const, dob: '2009-09-12', guardian: 'О. Оюунбилэг', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Шатрын клубийн гишүүн.', tags: ['Шатар'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 18, first: 'Отгонбат', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-04-04', guardian: 'Б. Бат-Эрдэнэ', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Хүйтэнд харшилтай', notes: 'Найрал дуу.', tags: ['Дуу хөгжим', 'Театр'], paid: 0, total: 1450000, dueDate: '2026-11-01' },
  { roll: 19, first: 'Отгонболор', last: 'Б.', gender: 'Эмэгтэй' as const, dob: '2009-10-28', guardian: 'Б. Болормаа', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Гүйгч.', tags: ['Спорт'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 20, first: 'Пүрэвдаш', last: 'Л.', gender: 'Эрэгтэй' as const, dob: '2009-07-16', guardian: 'Л. Лувсандорж', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Гүйлтийн тамирчин.', tags: ['Спорт'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 21, first: 'Сарангоо', last: 'Ө.', gender: 'Эмэгтэй' as const, dob: '2009-02-09', guardian: 'Ө. Өлзийсайхан', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Өвсний харшилтай', notes: 'Идэвхтэй.', tags: ['Эко клуб'], paid: 1100000, total: 1450000, dueDate: '2026-11-28' },
  { roll: 22, first: 'Содсаран', last: 'Н.', gender: 'Эмэгтэй' as const, dob: '2009-11-05', guardian: 'Н. Наранцэцэг', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Уран зохиол.', tags: ['Уран зохиол'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 23, first: 'Төгс-Учрал', last: 'М.', gender: 'Эрэгтэй' as const, dob: '2009-05-18', guardian: 'М. Мөнх-Оргил', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Тайзны гэрэлтүүлэг.', tags: ['Театр'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 24, first: 'Тэмүүгэн', last: 'Т.', gender: 'Эрэгтэй' as const, dob: '2009-08-23', guardian: 'Т. Төмөртогоо', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Шил зүүдэг', notes: 'Мэтгэлцээн.', tags: ['Мэтгэлцээн'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 25, first: 'Тэмүүлэн', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-12-14', guardian: 'Б. Баярхүү', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Харшилгүй', notes: 'Химийн хичээл.', tags: ['Хими'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 26, first: 'Ундрах', last: 'Б.', gender: 'Эмэгтэй' as const, dob: '2009-03-29', guardian: 'Б. Уранчимэг', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Цэцэрлэгжүүлэлт.', tags: ['Эко клуб', 'Урлаг'], paid: 800000, total: 1450000, dueDate: '2026-11-18' },
  { roll: 27, first: 'Хүслэн', last: 'Г.', gender: 'Эмэгтэй' as const, dob: '2009-09-08', guardian: 'Г. Гансүх', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Компьютер.', tags: ['Компьютер'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 28, first: 'Цэлмүүн', last: 'Ү.', gender: 'Эмэгтэй' as const, dob: '2009-04-17', guardian: 'Ү. Үнэнбат', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Морин хуур.', tags: ['Хөгжим'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 29, first: 'Эгшиглэн', last: 'Ү.', gender: 'Эмэгтэй' as const, dob: '2009-10-02', guardian: 'Ү. Үнэнбат', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Харшилгүй', notes: 'Идэвхтэй сурагч.', tags: ['Спорт', 'Мэтгэлцээн'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 30, first: 'Эгшиглэн', last: 'Г.', gender: 'Эмэгтэй' as const, dob: '2009-06-15', guardian: 'Г. Ганбаатар', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Арьсны харшил', notes: 'Сурагчдын зөвлөл.', tags: ['Зөвлөл'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 31, first: 'Энхжин', last: 'Т.', gender: 'Эмэгтэй' as const, dob: '2009-01-31', guardian: 'Т. Энхбаяр', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Газарзүй.', tags: ['Газарзүй'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 32, first: 'Энхлүүн', last: 'Т.', gender: 'Эмэгтэй' as const, dob: '2009-07-28', guardian: 'Т. Энхтуяа', relation: 'Ээж' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Гар бөмбөг.', tags: ['Волейбол', 'Спорт'], paid: 600000, total: 1450000, dueDate: '2026-11-20' },
  { roll: 33, first: 'Энхмөрөн', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-11-22', guardian: 'Б. Бат-Оргил', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Нүдний шил', notes: 'Компьютер.', tags: ['Компьютер'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
  { roll: 34, first: 'Эрдэнэбат', last: 'Б.', gender: 'Эрэгтэй' as const, dob: '2009-05-06', guardian: 'Б. Батжаргал', relation: 'Аав' as const, fatherPhone: '', motherPhone: '', medical: 'Байхгүй', notes: 'Уран зохиол.', tags: ['Уран зохиол'], paid: 1450000, total: 1450000, dueDate: '2026-11-15' },
];

export function generateInitialStudents(): Student[] {
  return MONGOLIAN_34_STUDENTS.map((item) => {
    const studentId = `STU-${String(item.roll).padStart(3, '0')}`;
    const balance = item.total - item.paid;
    let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'paid';
    if (balance <= 0) {
      status = 'paid';
    } else if (item.paid > 0) {
      status = 'partial';
    } else {
      if (item.dueDate < '2026-11-09') {
        status = 'overdue';
      } else {
        status = 'pending';
      }
    }

    const tx = item.paid > 0 ? [
      {
        id: `tx-${studentId}-1`,
        date: '2026-09-03',
        amount: item.paid,
        method: 'Дансаар / Банк' as const,
        receiptNumber: `БАР-2026-${String(item.roll).padStart(3, '0')}`,
        notes: '2026-2027 оны намрын улирлын сургалт, дүрэмт хувцасны төлбөр',
        recordedBy: 'Ангийн багш (Администратор)',
      }
    ] : [];

    return {
      id: studentId,
      rollNumber: item.roll,
      firstName: item.first,
      lastName: item.last,
      gender: item.gender,
      dateOfBirth: item.dob,
      email: `student${item.roll}@school13.edu.mn`,
      phone: '',
      guardianName: item.guardian,
      guardianRelation: item.relation,
      guardianPhone: '',
      fatherPhone: '',
      motherPhone: '',
      guardianEmail: `student${item.roll}@school13.edu.mn`,
      address: `Улаанбаатар хот, Баянзүрх дүүрэг, 13-р хороо`,
      emergencyContact: item.guardian,
      bloodGroup: ['I (O+)', 'II (A+)', 'III (B+)', 'IV (AB+)'][item.roll % 4],
      medicalAlerts: item.medical,
      generalNotes: item.notes,
      tags: item.tags,
      accountRegistered: false,
      payment: {
        status,
        totalTuition: item.total,
        amountPaid: item.paid,
        balanceDue: balance,
        dueDate: item.dueDate,
        lastPaymentDate: tx.length > 0 ? tx[0].date : undefined,
        term: '2026-2027 Намрын улирал',
        fees: [
          { id: 'fee-1', category: 'Үндсэн сургалтын төлбөр', amount: 1200000, paid: item.paid >= 1200000 },
          { id: 'fee-2', category: 'Дүрэмт хувцасны хураамж (Форм)', amount: 150000, paid: item.paid >= 1350000 },
          { id: 'fee-3', category: 'Лаборатори, номын сангийн хураамж', amount: 100000, paid: item.paid >= 1450000 },
        ],
        transactions: tx,
      },
      notesLog: [
        {
          id: `note-${studentId}-1`,
          date: '2026-09-01',
          author: 'Ангийн багш',
          category: 'Захиргаа',
          content: `Нийслэлийн 13-р сургуулийн 12Б ангид албан ёсоор бүртгэгдэв. Жагсаалтын дугаар: #${item.roll}.`,
        },
      ],
    };
  });
}

export function generateInitialDailyLog(dateStr: string = '2026-11-09', students: Student[]): DailyClassLog {
  const records: Record<string, DailyClassLog['records'][string]> = {};

  students.forEach((student) => {
    let pStatuses: Record<number, AttendanceStatus> = {
      1: 'present',
      2: 'present',
      3: 'present',
      4: 'present',
      5: 'present',
      6: 'present',
      7: 'present',
    };

    let uniformStatus: UniformStatus = 'compliant';
    let violationReason: string | undefined = undefined;

    if (student.rollNumber === 9) {
      pStatuses = { 1: 'absent', 2: 'absent', 3: 'absent', 4: 'absent', 5: 'absent', 6: 'absent', 7: 'absent' };
      uniformStatus = 'non_compliant';
      violationReason = 'Хичээлд ирээгүй (өвчтэй эмчийн магадлагаатай)';
    } else if (student.rollNumber === 14) {
      pStatuses[1] = 'late';
      uniformStatus = 'compliant';
    } else if (student.rollNumber === 21) {
      pStatuses[4] = 'excused';
      uniformStatus = 'compliant';
    } else if (student.rollNumber === 6) {
      uniformStatus = 'partial';
      violationReason = 'Сургуулийн дүрэмт пиджак дутуу';
    } else if (student.rollNumber === 11) {
      uniformStatus = 'non_compliant';
      violationReason = 'Хар гутал өмсөөгүй, пүүзтэй ирсэн';
    } else if (student.rollNumber === 30) {
      uniformStatus = 'exempt';
      violationReason = 'Арьсны харшлын эмчийн чөлөөтэй';
    } else if (student.rollNumber === 18) {
      pStatuses[1] = 'late';
    }

    records[student.id] = {
      periods: pStatuses,
      uniform: {
        status: uniformStatus,
        violationReason,
        inspectedAt: '08:05',
        resolved: false,
      },
      dailyRemark: student.rollNumber === 9 ? 'Ээж нь 07:45-д залгаж ханиад хүрсэн гэж мэдэгдсэн.' : undefined,
    };
  });

  return {
    date: dateStr,
    records,
    dayNotes: 'Нийслэлийн 13-р сургууль, 12Б ангийн өдрийн ирцийн үзлэг. Баталгаажуулсан: Ангийн багш.',
    verifiedByAdmin: true,
    verifiedAt: '08:20',
  };
}
