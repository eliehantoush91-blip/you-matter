import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface TestCardProps {
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  link?: string;
}

const TestCard = ({ icon: Icon, titleAr, titleEn, descriptionAr, descriptionEn, link }: TestCardProps) => {
  const { t } = useLanguage();

  const cardContent = (
    <>
      <CardHeader>
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{t(titleAr, titleEn)}</CardTitle>
        <CardDescription className="text-base">
          {t(descriptionAr, descriptionEn)}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {t('ابدأ الآن', 'Start Now')}
        </Button>
      </CardFooter>
    </>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        <Card className="shadow-card hover:shadow-soft transition-smooth h-full cursor-pointer">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-soft transition-smooth">
      {cardContent}
    </Card>
  );
};

export default TestCard;
