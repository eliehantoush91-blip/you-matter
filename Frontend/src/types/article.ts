export type Language = "en" | "ar";

export interface Article {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  content: {
    en: string;
    ar: string;
  };
  category: string;
  author: {
    name: {
      en: string;
      ar: string;
    };
    bio: {
      en: string;
      ar: string;
    };
    image: string;
  };
  image: string;
  publishDate: string;
  readTime: number;
  views: number;
  rating: number;
}

export const categories = {
  en: [
    "All Categories",
    "Depression",
    "Anxiety",
    "Sleep Disorders",
    "Trauma",
    "Bipolar",
    "OCD",
    "General Wellness",
  ],
  ar: [
    "جميع الفئات",
    "الاكتئاب",
    "القلق",
    "اضطرابات النوم",
    "الصدمات",
    "ثنائي القطب",
    "الوسواس القهري",
    "الصحة العامة",
  ],
};

export const sortOptions = {
  en: ["Newest First", "Most Popular", "Highest Rated"],
  ar: ["الأحدث أولاً", "الأكثر شعبية", "الأعلى تقييماً"],
};
