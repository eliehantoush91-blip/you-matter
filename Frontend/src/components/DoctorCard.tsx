import { Doctor, Language } from '@/types/doctor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DoctorCardProps {
  doctor: Doctor;
  language: Language;
  onViewDetails: (doctor: Doctor) => void;
}

export const DoctorCard = ({ doctor, language, onViewDetails }: DoctorCardProps) => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate(`/book-appointment?doctorId=${doctor.id}`);
  };

  const isRTL = language === 'ar';

  return (
    <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 hover:scale-105">
      <CardContent className={`p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-start gap-4 mb-4`}>
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={doctor.image} alt={doctor.name[language]} />
            <AvatarFallback className="bg-secondary text-2xl">
              {doctor.name[language].split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
              {doctor.name[language]}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {doctor.specialty[language]}
            </p>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 text-sm`}>
              <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-1 text-accent`}>
                <Star className="h-4 w-4 fill-accent" />
                <span className="font-semibold">{doctor.rating}</span>
              </div>
              <span className="text-muted-foreground">
                ({doctor.reviewCount} {language === 'ar' ? 'تقييم' : 'reviews'})
              </span>
            </div>
          </div>
        </div>

        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 text-sm text-muted-foreground mb-4`}>
          <Calendar className="h-4 w-4" />
          <span>
            {language === 'ar' 
              ? `${doctor.yearsOfExperience} سنوات خبرة` 
              : `${doctor.yearsOfExperience} years experience`}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleBookAppointment}
          >
            {language === 'ar' ? 'احجز موعد' : 'Book Appointment'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => onViewDetails(doctor)}
          >
            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
