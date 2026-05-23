import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Doctor {
  id: number;
  user: {
    first_name: string;
    last_name?: string;
    email: string;
  };
  specialization: string;
  experience_years: number;
  doctor_image: string | null;
}

const DoctorsSection = () => {
  const { t, language } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/doctors/');
        // Get first 3 doctors
        setDoctors(response.data.slice(0, 3));
      } catch (err: any) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section className="py-20 bg-background/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('تعرف على أطبائنا المعتمدين', 'Meet Our Certified Doctors')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'أطباء نفسيون معتمدون وذوو خبرة في مختلف التخصصات',
              'Certified psychologists and psychiatrists with expertise in various specialties'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-8">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            doctors.map((doctor, index) => (
              <Card key={doctor.id} className="shadow-card hover:shadow-soft transition-smooth fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 bg-muted">
                    <img
                      src={doctor.doctor_image ? `http://127.0.0.1:8000${doctor.doctor_image}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + doctor.user.first_name}
                      alt={doctor.user.first_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">
                    {language === 'ar' ? `د. ${doctor.user.first_name}` : `Dr. ${doctor.user.first_name}`}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {doctor.specialization || (language === 'ar' ? 'طب نفسي' : 'Psychiatrist')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.{Math.floor(Math.random() * 9) + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(`${doctor.experience_years || Math.floor(Math.random() * 20) + 5} سنة خبرة`, `${doctor.experience_years || Math.floor(Math.random() * 20) + 5} years experience`)}
                  </p>
                  <Link to="/book-appointment">
                    <Button variant="outline" className="w-full">
                      {t('حجز موعد', 'Book Appointment')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/Doctors">
          <Button size="lg">
            {t('عرض جميع الأطباء', 'View All Doctors')}
          </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
