export enum PedagogicalPractice {
  INQUIRY_DISCOVERY = 'Inkuiri-Discovery',
  PJBL = 'PjBL',
  PROBLEM_SOLVING = 'Problem Solving',
  GAME_BASED = 'Game Based Learning',
  STATION_LEARNING = 'Station Learning',
}

export enum GraduateDimension {
  FAITH = 'Keimanan & Ketakwaan',
  CITIZENSHIP = 'Kewargaan',
  CRITICAL_REASONING = 'Penalaran Kritis',
  CREATIVITY = 'Kreativitas',
  COLLABORATION = 'Kolaborasi',
  INDEPENDENCE = 'Kemandirian',
  HEALTH = 'Kesehatan',
  COMMUNICATION = 'Komunikasi',
}

export interface RPMInput {
  teacherName: string;
  teacherNip: string;
  className: string;
  subject: string;
  learningObjectives: string;
  subjectMatter: string;
  language: 'Bahasa Inggris' | 'Bahasa Arab';
  meetings: number;
  pedagogicalPractices: PedagogicalPractice[];
  graduateDimensions: GraduateDimension[];
}