
export enum Rating {
  NotTaught = 0,
  Low = 1,
  Partial = 2,
  Proficient = 3,
  Excellent = 4,
}

export interface Competency {
  id: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  competencies: Competency[];
}

export interface Subject {
  id: string;
  name: string;
  categories: Category[];
}

export interface Student {
  id: string;
  name: string;
  assessments: Record<string, Rating>; // key: competency.id
}

export interface AppState {
    students: Student[];
    subjects: Subject[];
}
