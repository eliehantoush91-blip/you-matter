export interface Doctor {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  specialty: {
    ar: string;
    en: string;
  };
  image: string;
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
  bio: {
    ar: string;
    en: string;
  };
  education: {
    ar: string[];
    en: string[];
  };
  certifications: {
    ar: string[];
    en: string[];
  };
  expertise: {
    ar: string[];
    en: string[];
  };
  availableSlots: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  patientName: {
    ar: string;
    en: string;
  };
  rating: number;
  comment: {
    ar: string;
    en: string;
  };
  date: string;
}

export type Language = 'ar' | 'en';

export const specialties = {
  ar: [
    'جميع التخصصات',
    'الاكتئاب',
    'القلق',
    'اضطرابات النوم',
    'الصدمات النفسية',
    'الاضطراب ثنائي القطب',
    'الوسواس القهري',
  ],
  en: [
    'All Specialties',
    'Depression',
    'Anxiety',
    'Sleep Disorders',
    'Trauma',
    'Bipolar Disorder',
    'OCD',
  ],
};
