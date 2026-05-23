import { useState, useMemo, useEffect } from 'react';
import { Doctor, Language, specialties } from '@/types/doctor';
import { doctors as doctorsData } from '@/data/doctors';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorDetailsModal } from '@/components/DoctorDetailsModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';

interface DoctorApiData {
  id: number;
  user: {
    id: number;
    username: string;
    role: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  specialization: string;
  clinic_location: string;
  contact_info: string;
  experiance_years: number;
  working_hours: any;
  availability_schedule: any;
  doctor_image: string;
}

const Doctors = () => {
  const { language: globalLang } = useLanguage();
  const language = (globalLang === 'ar' ? 'ar' : 'en') as Language;
  const [apiDoctors, setApiDoctors] = useState<DoctorApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://127.0.0.1:8000/api/doctors/');
      console.log('Doctors API Response:', response.data);
      setApiDoctors(response.data);
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load doctors';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Transform API doctors to match Doctor interface
  const transformedDoctors = useMemo(() => {
    return apiDoctors.map(apiDoctor => ({
      id: apiDoctor.id.toString(),
      name: {
        en: `${apiDoctor.user.first_name} ${apiDoctor.user.last_name}`,
        ar: `${apiDoctor.user.first_name} ${apiDoctor.user.last_name}` // Use same name for both languages for now
      },
      specialty: {
        en: apiDoctor.specialization || 'General Psychiatry',
        ar: apiDoctor.specialization || 'طب نفسي عام'
      },
      image: apiDoctor.doctor_image
        ? `http://127.0.0.1:8000${apiDoctor.doctor_image}`
        : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      yearsOfExperience: apiDoctor.experiance_years || 0,
      rating: 4.5, // Placeholder
      reviewCount: Math.floor(Math.random() * 50) + 10, // Placeholder
      bio: {
        en: `Experienced ${apiDoctor.specialization || 'psychiatrist'} with ${apiDoctor.experiance_years || 0} years of practice.`,
        ar: `طبيب ${apiDoctor.specialization || 'نفسي'} ذو خبرة مع ${apiDoctor.experiance_years || 0} سنوات من الممارسة.`
      },
      education: {
        en: ['Medical Degree', 'Psychiatry Residency'],
        ar: ['درجة طبية', 'إقامة في الطب النفسي']
      },
      certifications: {
        en: ['Board Certified Psychiatrist'],
        ar: ['طبيب نفسي معتمد']
      },
      expertise: {
        en: [apiDoctor.specialization || 'General Psychiatry'],
        ar: [apiDoctor.specialization || 'طب نفسي عام']
      },
      availableSlots: [], // Will be populated when needed
      reviews: [] // Will be populated when needed
    }));
  }, [apiDoctors]);

  console.log('API Doctors:', apiDoctors);
  console.log('Transformed Doctors:', transformedDoctors);

  const isRTL = language === 'ar';

  const filteredDoctors = useMemo(() => {
    // Use transformed API doctors if available, otherwise fallback to hardcoded data
    const doctorsToFilter = transformedDoctors.length > 0 ? transformedDoctors : doctorsData;
    return doctorsToFilter.filter((doctor) => {
      const matchesSearch = 
        doctor.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty[language].toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = 
        selectedSpecialty === 'all' || 
        doctor.specialty[language].toLowerCase().includes(selectedSpecialty.toLowerCase());

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty, language, transformedDoctors]);

  console.log('Filtered Doctors:', filteredDoctors);

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background  via-primary/10 to-accent/8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/14 via-secondary/32 via-accent/10 to-background/95 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'الأطباء' : 'Doctors'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ar' 
              ? 'اختر من بين أفضل الأطباء المتخصصين في الصحة النفسية'
              : 'Choose from our best mental health specialists'}
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
            <Input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن طبيب أو تخصص...' : 'Search by name or specialty...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-10' : 'pl-10'} bg-card border-border text-foreground`}
            />
          </div>

          {/* Specialty Filter */}
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="bg-card border-border text-foreground">
              <SelectValue placeholder={language === 'ar' ? 'اختر التخصص' : 'Select Specialty'} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">
                {language === 'ar' ? 'جميع التخصصات' : 'All Specialties'}
              </SelectItem>
              {specialties[language].slice(1).map((specialty, index) => (
                <SelectItem key={index} value={specialty.toLowerCase()}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {language === 'ar'
              ? `${filteredDoctors.length} طبيب متاح`
              : `${filteredDoctors.length} doctors available`}
          </p>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'جاري تحميل الأطباء...' : 'Loading doctors...'}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchDoctors}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              language={language}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
        )}

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              {language === 'ar'
                ? 'لم يتم العثور على أطباء يطابقون بحثك'
                : 'No doctors found matching your search'}
            </p>
          </div>
        )}
      </div>

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        doctor={selectedDoctor}
        language={language}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Doctors;
