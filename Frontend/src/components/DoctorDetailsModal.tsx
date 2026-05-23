import { Doctor, Language } from '@/types/doctor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, GraduationCap, Award, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorDetailsModal = ({ doctor, language, isOpen, onClose }: DoctorDetailsModalProps) => {
  const navigate = useNavigate();

  if (!doctor) return null;

  const handleBookNow = () => {
    navigate(`/book-appointment?doctorId=${doctor.id}`);
    onClose();
  };

  const isRTL = language === 'ar';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-3xl max-h-[90vh] bg-card border-border ${isRTL ? 'text-right' : 'text-left'}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{doctor.name[language]}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Doctor Header */}
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-start gap-6`}>
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={doctor.image} alt={doctor.name[language]} />
                <AvatarFallback className="bg-secondary text-3xl">
                  {doctor.name[language].split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-lg text-primary font-semibold mb-2">
                  {doctor.specialty[language]}
                </p>
                <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-4 mb-3`}>
                  <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                    <Star className="h-5 w-5 text-accent fill-accent" />
                    <span className="font-semibold text-lg">{doctor.rating}</span>
                    <span className="text-muted-foreground">
                      ({doctor.reviewCount} {language === 'ar' ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                  <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 text-muted-foreground`}>
                    <Calendar className="h-5 w-5" />
                    <span>
                      {language === 'ar' 
                        ? `${doctor.yearsOfExperience} سنوات خبرة` 
                        : `${doctor.yearsOfExperience} years experience`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className={`text-lg font-semibold mb-2 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                <Brain className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'نبذة عن الطبيب' : 'About the Doctor'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {doctor.bio[language]}
              </p>
            </div>

            {/* Education */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                <GraduationCap className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'المؤهلات العلمية' : 'Education'}
              </h3>
              <ul className={`space-y-2 ${isRTL ? 'pr-6' : 'pl-6'}`}>
                {doctor.education[language].map((edu, index) => (
                  <li key={index} className="text-muted-foreground list-disc">
                    {edu}
                  </li>
                ))}
              </ul>
            </div>

            {/* Certifications */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                <Award className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'الشهادات والتراخيص' : 'Certifications & Licenses'}
              </h3>
              <ul className={`space-y-2 ${isRTL ? 'pr-6' : 'pl-6'}`}>
                {doctor.certifications[language].map((cert, index) => (
                  <li key={index} className="text-muted-foreground list-disc">
                    {cert}
                  </li>
                ))}
              </ul>
            </div>

            {/* Expertise */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                {language === 'ar' ? 'مجالات التخصص' : 'Areas of Expertise'}
              </h3>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {doctor.expertise[language].map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Available Slots */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                <Calendar className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'المواعيد المتاحة' : 'Available Appointment Slots'}
              </h3>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {doctor.availableSlots.map((slot, index) => (
                  <Badge key={index} variant="outline" className="text-sm border-primary">
                    {slot}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                {language === 'ar' ? 'آراء المرضى' : 'Patient Reviews'}
              </h3>
              <div className="space-y-4">
                {doctor.reviews.map((review) => (
                  <div key={review.id} className="bg-muted p-4 rounded-lg">
                    <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center justify-between mb-2`}>
                      <span className="font-semibold">{review.patientName[language]}</span>
                      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-1`}>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment[language]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Now Button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleBookNow}
            >
              {language === 'ar' ? 'احجز الآن' : 'Book Now'}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
