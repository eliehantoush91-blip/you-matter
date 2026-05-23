import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Language } from "@/types/article";
import { articles } from "@/data/articles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Clock, Eye, Star, Share2, Facebook, Twitter, Linkedin, Loader2 } from "lucide-react";
import ArticleCard from "@/components/articles/ArticleCard";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ArticleApiData {
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

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language: globalLang } = useLanguage();
  const language = (globalLang === 'ar' ? 'ar' : 'en') as Language;
  
  const [apiArticle, setApiArticle] = useState<ArticleApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback to hardcoded data
  const article = apiArticle ? {
    id: apiArticle.id.toString(),
    title: {
      en: apiArticle.translations?.en?.title || apiArticle.translations?.ar?.title || 'Untitled Article',
      ar: apiArticle.translations?.ar?.title || apiArticle.translations?.en?.title || 'مقالة بدون عنوان'
    },
    description: {
      en: ((apiArticle.translations?.en?.content || apiArticle.translations?.ar?.content || '').substring(0, 150)) + ((apiArticle.translations?.en?.content || apiArticle.translations?.ar?.content || '').length > 150 ? "..." : ""),
      ar: ((apiArticle.translations?.ar?.content || apiArticle.translations?.en?.content || '').substring(0, 150)) + ((apiArticle.translations?.ar?.content || apiArticle.translations?.en?.content || '').length > 150 ? "..." : "")
    },
    content: {
      en: apiArticle.translations?.en?.content || apiArticle.translations?.ar?.content || '',
      ar: apiArticle.translations?.ar?.content || apiArticle.translations?.en?.content || ''
    },
    image: apiArticle.image ? `http://127.0.0.1:8000${apiArticle.image}` : "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    category: "Mental Health",
    author: {
      name: {
        en: apiArticle.author || 'Unknown Author',
        ar: apiArticle.author || 'مؤلف غير معروف'
      },
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      bio: {
        en: `Expert in mental health with years of experience.`,
        ar: `خبير في الصحة النفسية مع سنوات من الخبرة.`
      }
    },
    publishDate: apiArticle.created_at,
    readTime: Math.ceil((apiArticle.translations?.en?.content || apiArticle.translations?.ar?.content || '').length / 1000) || 1,
    views: Math.floor(Math.random() * 1000),
    rating: 4.5,
    tags: ["mental-health"]
  } : articles.find((a) => a.id === id);

  const relatedArticles = articles
    .filter((a) => a.id !== id && a.category === article?.category)
    .slice(0, 3);

  const fetchArticleDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://127.0.0.1:8000/api/articles/${id}/`, {
        params: { language: globalLang }
      });

      setApiArticle(response.data);
    } catch (err: any) {
      console.error('Error fetching article details:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load article';
      setError(errorMessage);
      // Don't show error for now, fallback to hardcoded data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleDetails();
  }, [id, globalLang]);

  const isRTL = language === "ar";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background  via-primary/10 to-accent/8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link to="/articles">
            <Button variant="default">Back to Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Link to="/articles">
            <Button variant="default">Back to Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === "en"
      ? date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : date.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article.title[language];
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({
          title: language === "en" ? "Link copied!" : "تم نسخ الرابط!",
          description: language === "en" ? "Article link copied to clipboard" : "تم نسخ رابط المقال إلى الحافظة",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const translations = {
    en: {
      back: "Back to Articles",
      readTime: "min read",
      views: "views",
      authorBio: "About the Author",
      related: "Related Articles",
      share: "Share Article",
    },
    ar: {
      back: "العودة للمقالات",
      readTime: "دقيقة",
      views: "مشاهدة",
      authorBio: "عن الكاتب",
      related: "مقالات ذات صلة",
      share: "مشاركة المقال",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background  via-primary/10 to-accent/8" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/articles")}
          className={`gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          <span>{t.back}</span>
        </Button>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          <div className="aspect-video rounded-lg overflow-hidden mb-8 shadow-glow">
            <img
              src={article.image}
              alt={article.title[language]}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" dir={isRTL ? "rtl" : "ltr"}>
              {article.title[language]}
            </h1>

            {/* Meta Info */}
            <div className={`flex flex-wrap items-center gap-4 text-muted-foreground mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={article.author.image} />
                  <AvatarFallback>{article.author.name[language][0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium" dir={isRTL ? "rtl" : "ltr"}>{article.author.name[language]}</span>
              </div>
              <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publishDate)}</span>
              </div>
              <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Clock className="w-4 h-4" />
                <span>{article.readTime} {t.readTime}</span>
              </div>
              <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Eye className="w-4 h-4" />
                <span>{article.views} {t.views}</span>
              </div>
              <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span>{article.rating}</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className="text-sm font-medium">{t.share}:</span>
              <Button variant="outline" size="icon" onClick={() => handleShare("facebook")}>
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare("twitter")}>
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare("linkedin")}>
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare("copy")}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Article Body */}
          <div
            className="prose prose-lg max-w-none mb-12 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground"
            dir={isRTL ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{
              __html: article.content[language].replace(/\n/g, "<br/>").replace(/##/g, "<h2>").replace(/<h2>/g, "<h2 class='text-2xl font-bold mt-8 mb-4'>"),
            }}
          />

          {/* Author Bio */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle dir={isRTL ? "rtl" : "ltr"}>{t.authorBio}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Avatar className="w-16 h-16">
                  <AvatarImage src={article.author.image} />
                  <AvatarFallback>{article.author.name[language][0]}</AvatarFallback>
                </Avatar>
                <div className={isRTL ? "text-right" : ""}>
                  <h3 className="font-semibold text-lg mb-1" dir={isRTL ? "rtl" : "ltr"}>
                    {article.author.name[language]}
                  </h3>
                  <p className="text-muted-foreground" dir={isRTL ? "rtl" : "ltr"}>
                    {article.author.bio[language]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-6" dir={isRTL ? "rtl" : "ltr"}>
                {t.related}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard key={relatedArticle.id} article={relatedArticle} language={language} />
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default ArticleDetails;
