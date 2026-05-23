import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Article {
  id: number;
  translations: {
    en: {
      title: string;
      content: string;
    };
    ar: {
      title: string;
      content: string;
    };
  };
  author: string;
  image: string | null;
  created_at: string;
}

const EducationalContent = () => {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/articles/', {
          params: { language }
        });
        // Get first 3 articles
        setArticles(response.data.slice(0, 3));
      } catch (err: any) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [language]);

  return (
    <section className="py-20 bg-card/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('تعلم أكثر عن صحتك النفسية', 'Learn More About Your Mental Health')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'مقالات وفيديوهات تعليمية من خبراء الصحة النفسية',
              'Educational articles and videos from mental health experts'
            )}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {t('مقالات تعليمية', 'Educational Articles')}
            </h3>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {articles.map((article, index) => {
                const title = language === 'ar'
                  ? article.translations.ar.title
                  : article.translations.en.title;
                const content = language === 'ar'
                  ? article.translations.ar.content
                  : article.translations.en.content;
                const truncatedContent = content.length > 120
                  ? content.substring(0, 120) + "..."
                  : content;

                return (
                  <Card key={article.id} className="shadow-card hover:shadow-soft transition-smooth cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {truncatedContent}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{article.author}</span>
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/articles">
            <Button size="lg" variant="outline">
              {t('عرض المزيد', 'See More')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EducationalContent;
