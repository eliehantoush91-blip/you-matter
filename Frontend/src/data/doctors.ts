import { Doctor } from '@/types/doctor';

export const doctors: Doctor[] = [
  {
    id: '1',
    name: {
      ar: 'د. أحمد السعيد',
      en: 'Dr. Ahmed Al-Saeed',
    },
    specialty: {
      ar: 'الطب النفسي - الاكتئاب والقلق',
      en: 'Psychiatry - Depression & Anxiety',
    },
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    yearsOfExperience: 15,
    rating: 4.9,
    reviewCount: 127,
    bio: {
      ar: 'طبيب نفسي متخصص في علاج الاكتئاب والقلق مع خبرة تزيد عن 15 عامًا. حاصل على شهادة البورد الأمريكي في الطب النفسي وزمالة من جامعة هارفارد. يستخدم أحدث الطرق العلاجية المبنية على الأدلة العلمية.',
      en: 'Psychiatrist specializing in depression and anxiety treatment with over 15 years of experience. Board-certified by the American Board of Psychiatry and holds a fellowship from Harvard University. Uses the latest evidence-based therapeutic approaches.',
    },
    education: {
      ar: [
        'بكالوريوس الطب والجراحة - جامعة القاهرة',
        'ماجستير الطب النفسي - جامعة عين شمس',
        'زمالة الطب النفسي - جامعة هارفارد',
      ],
      en: [
        'MBBS - Cairo University',
        'Masters in Psychiatry - Ain Shams University',
        'Psychiatry Fellowship - Harvard University',
      ],
    },
    certifications: {
      ar: [
        'البورد الأمريكي للطب النفسي',
        'شهادة العلاج المعرفي السلوكي',
        'شهادة علاج الصدمات النفسية',
      ],
      en: [
        'American Board of Psychiatry',
        'Cognitive Behavioral Therapy Certification',
        'Trauma Therapy Certification',
      ],
    },
    expertise: {
      ar: ['الاكتئاب', 'القلق', 'اضطرابات الهلع', 'العلاج المعرفي السلوكي'],
      en: ['Depression', 'Anxiety', 'Panic Disorders', 'Cognitive Behavioral Therapy'],
    },
    availableSlots: ['10:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'],
    reviews: [
      {
        id: '1',
        patientName: { ar: 'محمد علي', en: 'Mohamed Ali' },
        rating: 5,
        comment: {
          ar: 'دكتور ممتاز، ساعدني كثيرًا في التغلب على القلق',
          en: 'Excellent doctor, helped me greatly in overcoming anxiety',
        },
        date: '2024-01-15',
      },
    ],
  },
  {
    id: '2',
    name: {
      ar: 'د. سارة محمود',
      en: 'Dr. Sarah Mahmoud',
    },
    specialty: {
      ar: 'علم النفس السريري - اضطرابات النوم',
      en: 'Clinical Psychology - Sleep Disorders',
    },
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    yearsOfExperience: 12,
    rating: 4.8,
    reviewCount: 98,
    bio: {
      ar: 'أخصائية نفسية سريرية متخصصة في علاج اضطرابات النوم والأرق. خبرة واسعة في العلاج السلوكي المعرفي للأرق وتقنيات الاسترخاء.',
      en: 'Clinical psychologist specializing in sleep disorders and insomnia treatment. Extensive experience in Cognitive Behavioral Therapy for Insomnia and relaxation techniques.',
    },
    education: {
      ar: [
        'بكالوريوس علم النفس - الجامعة الأمريكية بالقاهرة',
        'ماجستير علم النفس السريري - جامعة لندن',
        'دكتوراه في اضطرابات النوم - جامعة ستانفورد',
      ],
      en: [
        'BA in Psychology - American University in Cairo',
        'MSc in Clinical Psychology - University of London',
        'PhD in Sleep Disorders - Stanford University',
      ],
    },
    certifications: {
      ar: [
        'شهادة العلاج السلوكي المعرفي للأرق',
        'شهادة الطب السلوكي للنوم',
        'عضو الأكاديمية الأمريكية لطب النوم',
      ],
      en: [
        'CBT-I Certification',
        'Behavioral Sleep Medicine Certification',
        'Member of American Academy of Sleep Medicine',
      ],
    },
    expertise: {
      ar: ['اضطرابات النوم', 'الأرق', 'انقطاع النفس النومي', 'العلاج السلوكي المعرفي'],
      en: ['Sleep Disorders', 'Insomnia', 'Sleep Apnea', 'Cognitive Behavioral Therapy'],
    },
    availableSlots: ['9:00 AM', '11:00 AM', '3:00 PM', '5:00 PM'],
    reviews: [
      {
        id: '1',
        patientName: { ar: 'فاطمة حسن', en: 'Fatima Hassan' },
        rating: 5,
        comment: {
          ar: 'دكتورة رائعة، حلت مشكلة الأرق التي عانيت منها لسنوات',
          en: 'Amazing doctor, solved my insomnia problem that I suffered from for years',
        },
        date: '2024-01-20',
      },
    ],
  },
  {
    id: '3',
    name: {
      ar: 'د. خالد إبراهيم',
      en: 'Dr. Khaled Ibrahim',
    },
    specialty: {
      ar: 'الطب النفسي - الصدمات النفسية',
      en: 'Psychiatry - Trauma & PTSD',
    },
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    yearsOfExperience: 18,
    rating: 4.9,
    reviewCount: 145,
    bio: {
      ar: 'طبيب نفسي متخصص في علاج الصدمات النفسية واضطراب ما بعد الصدمة. خبرة واسعة في العمل مع الناجين من الحروب والكوارث.',
      en: 'Psychiatrist specializing in trauma and PTSD treatment. Extensive experience working with war and disaster survivors.',
    },
    education: {
      ar: [
        'بكالوريوس الطب والجراحة - جامعة الإسكندرية',
        'ماجستير الطب النفسي - جامعة القاهرة',
        'زمالة علاج الصدمات - جامعة ييل',
      ],
      en: [
        'MBBS - Alexandria University',
        'Masters in Psychiatry - Cairo University',
        'Trauma Therapy Fellowship - Yale University',
      ],
    },
    certifications: {
      ar: [
        'البورد المصري للطب النفسي',
        'شهادة EMDR',
        'شهادة علاج الصدمات المعقدة',
      ],
      en: [
        'Egyptian Board of Psychiatry',
        'EMDR Certification',
        'Complex Trauma Therapy Certification',
      ],
    },
    expertise: {
      ar: ['الصدمات النفسية', 'اضطراب ما بعد الصدمة', 'EMDR', 'العلاج النفسي للأزمات'],
      en: ['Trauma', 'PTSD', 'EMDR', 'Crisis Psychotherapy'],
    },
    availableSlots: ['10:00 AM', '1:00 PM', '3:00 PM', '7:00 PM'],
    reviews: [
      {
        id: '1',
        patientName: { ar: 'أحمد عبدالله', en: 'Ahmed Abdullah' },
        rating: 5,
        comment: {
          ar: 'دكتور متميز في تخصصه، ساعدني في التعافي من صدمة نفسية شديدة',
          en: 'Outstanding doctor in his field, helped me recover from severe trauma',
        },
        date: '2024-01-10',
      },
    ],
  },
  {
    id: '4',
    name: {
      ar: 'د. ليلى عبدالرحمن',
      en: 'Dr. Layla Abdulrahman',
    },
    specialty: {
      ar: 'علم النفس السريري - الاضطراب ثنائي القطب',
      en: 'Clinical Psychology - Bipolar Disorder',
    },
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    yearsOfExperience: 14,
    rating: 4.7,
    reviewCount: 89,
    bio: {
      ar: 'أخصائية نفسية متخصصة في علاج الاضطراب ثنائي القطب واضطرابات المزاج. تستخدم نهج علاجي شامل يجمع بين العلاج النفسي والدعم الأسري.',
      en: 'Clinical psychologist specializing in bipolar disorder and mood disorders. Uses a comprehensive therapeutic approach combining psychotherapy and family support.',
    },
    education: {
      ar: [
        'بكالوريوس علم النفس - جامعة القاهرة',
        'ماجستير علم النفس السريري - جامعة عين شمس',
        'دكتوراه في اضطرابات المزاج - جامعة كولومبيا',
      ],
      en: [
        'BA in Psychology - Cairo University',
        'MSc in Clinical Psychology - Ain Shams University',
        'PhD in Mood Disorders - Columbia University',
      ],
    },
    certifications: {
      ar: [
        'شهادة العلاج الأسري',
        'شهادة علاج اضطرابات المزاج',
        'عضو الجمعية المصرية للطب النفسي',
      ],
      en: [
        'Family Therapy Certification',
        'Mood Disorders Therapy Certification',
        'Member of Egyptian Psychiatric Association',
      ],
    },
    expertise: {
      ar: ['الاضطراب ثنائي القطب', 'اضطرابات المزاج', 'العلاج الأسري', 'الدعم النفسي'],
      en: ['Bipolar Disorder', 'Mood Disorders', 'Family Therapy', 'Psychological Support'],
    },
    availableSlots: ['9:00 AM', '12:00 PM', '4:00 PM', '6:00 PM'],
    reviews: [
      {
        id: '1',
        patientName: { ar: 'نور حسين', en: 'Nour Hussein' },
        rating: 5,
        comment: {
          ar: 'دكتورة متفهمة جدًا، ساعدتني في إدارة حالتي بشكل أفضل',
          en: 'Very understanding doctor, helped me manage my condition better',
        },
        date: '2024-01-25',
      },
    ],
  },
  {
    id: '5',
    name: {
      ar: 'د. عمر فاروق',
      en: 'Dr. Omar Farouk',
    },
    specialty: {
      ar: 'الطب النفسي - الوسواس القهري',
      en: 'Psychiatry - OCD',
    },
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
    yearsOfExperience: 11,
    rating: 4.8,
    reviewCount: 76,
    bio: {
      ar: 'طبيب نفسي متخصص في علاج الوسواس القهري واضطرابات القلق المرتبطة. يستخدم تقنيات العلاج التعرضي ومنع الاستجابة.',
      en: 'Psychiatrist specializing in OCD and related anxiety disorders. Uses Exposure and Response Prevention (ERP) techniques.',
    },
    education: {
      ar: [
        'بكالوريوس الطب والجراحة - جامعة المنصورة',
        'ماجستير الطب النفسي - جامعة القاهرة',
        'زمالة علاج الوسواس القهري - جامعة أكسفورد',
      ],
      en: [
        'MBBS - Mansoura University',
        'Masters in Psychiatry - Cairo University',
        'OCD Treatment Fellowship - Oxford University',
      ],
    },
    certifications: {
      ar: [
        'البورد المصري للطب النفسي',
        'شهادة العلاج التعرضي ومنع الاستجابة',
        'شهادة العلاج المعرفي السلوكي',
      ],
      en: [
        'Egyptian Board of Psychiatry',
        'ERP Therapy Certification',
        'Cognitive Behavioral Therapy Certification',
      ],
    },
    expertise: {
      ar: ['الوسواس القهري', 'اضطرابات القلق', 'العلاج التعرضي', 'العلاج المعرفي السلوكي'],
      en: ['OCD', 'Anxiety Disorders', 'Exposure Therapy', 'Cognitive Behavioral Therapy'],
    },
    availableSlots: ['11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'],
    reviews: [
      {
        id: '1',
        patientName: { ar: 'ياسمين أحمد', en: 'Yasmine Ahmed' },
        rating: 5,
        comment: {
          ar: 'دكتور ممتاز، ساعدني في السيطرة على الوسواس القهري',
          en: 'Excellent doctor, helped me control my OCD',
        },
        date: '2024-01-18',
      },
    ],
  },
  {
    id: '6',
    name: {
      ar: 'د. منى الشريف',
      en: 'Dr. Mona Al-Sharif',
    },
    specialty: {
      ar: 'علم النفس السريري - الاكتئاب',
      en: 'Clinical Psychology - Depression',
    },
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    yearsOfExperience: 13,
    rating: 4.9,
    reviewCount: 112,
    bio: {
      ar: 'أخصائية نفسية متخصصة في علاج الاكتئاب والحالات المزاجية. خبرة واسعة في العلاج النفسي الديناميكي والعلاج المعرفي السلوكي.',
      en: 'Clinical psychologist specializing in depression and mood conditions. Extensive experience in psychodynamic therapy and cognitive behavioral therapy.',
    },
    education: {
      ar: [
        'بكالوريوس علم النفس - الجامعة الأمريكية بالقاهرة',
        'ماجستير علم النفس السريري - جامعة القاهرة',
        'دكتوراه في علم النفس العيادي - جامعة لندن',
      ],
      en: [
        'BA in Psychology - American University in Cairo',
        'MSc in Clinical Psychology - Cairo University',
        'PhD in Clinical Psychology - University of London',
      ],
    },
    certifications: {
      ar: [
        'شهادة العلاج النفسي الديناميكي',
        'شهادة العلاج المعرفي السلوكي',
        'عضو الجمعية البريطانية لعلم النفس',
      ],
      en: [
        'Psychodynamic Therapy Certification',
        'Cognitive Behavioral Therapy Certification',
        'Member of British Psychological Society',
      ],
    },
    expertise: {
      ar: ['الاكتئاب', 'اضطرابات المزاج', 'العلاج النفسي الديناميكي', 'العلاج المعرفي السلوكي'],
      en: ['Depression', 'Mood Disorders', 'Psychodynamic Therapy', 'Cognitive Behavioral Therapy'],
    },
    availableSlots: ['10:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'],
    reviews: [
      {
        id: '1',
        patientName: { ar: 'كريم محمد', en: 'Karim Mohamed' },
        rating: 5,
        comment: {
          ar: 'دكتورة رائعة، ساعدتني في التغلب على الاكتئاب',
          en: 'Wonderful doctor, helped me overcome depression',
        },
        date: '2024-01-22',
      },
    ],
  },
];
