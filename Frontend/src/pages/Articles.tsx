import { useState, useMemo, useEffect } from "react";
import { Language, categories, sortOptions } from "@/types/article";
import { articles } from "@/data/articles";
import ArticleCard from "@/components/articles/ArticleCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";

interface ArticleData {
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

const Articles = () => {
  const { language: globalLang } = useLanguage();
  const language = globalLang === 'ar' ? 'ar' : 'en' as Language;
  const [apiArticles, setApiArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://127.0.0.1:8000/api/articles/', {
        params: { language: globalLang }
      });

      setApiArticles(response.data);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load articles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [globalLang]);

  // Transform API articles to match ArticleCard expected format
  const transformedArticles = useMemo(() => {
    return apiArticles.map(apiArticle => {
      // Handle Parler translations structure: translations.ar and translations.en
      const enTitle = apiArticle.translations?.en?.title || apiArticle.translations?.ar?.title || 'Untitled Article';
      const arTitle = apiArticle.translations?.ar?.title || apiArticle.translations?.en?.title || 'مقالة بدون عنوان';
      const enContent = apiArticle.translations?.en?.content || apiArticle.translations?.ar?.content || '';
      const arContent = apiArticle.translations?.ar?.content || apiArticle.translations?.en?.content || '';

      const enTruncatedContent = enContent.length > 150 ? enContent.substring(0, 150) + "..." : enContent;
      const arTruncatedContent = arContent.length > 150 ? arContent.substring(0, 150) + "..." : arContent;

      return {
        id: apiArticle.id.toString(),
        title: {
          en: enTitle,
          ar: arTitle
        },
        description: {
          en: enTruncatedContent,
          ar: arTruncatedContent
        },
        content: {
          en: enContent,
          ar: arContent
        },
        image: apiArticle.image ? `http://127.0.0.1:8000${apiArticle.image}` : "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800", // Use actual image or fallback
        category: "Mental Health", // Default category
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
        readTime: Math.ceil(enContent.length / 1000) || 1, // Rough estimate, minimum 1
        views: Math.floor(Math.random() * 1000), // Placeholder
        rating: 4.5, // Placeholder
        tags: ["mental-health"] // Placeholder
      };
    });
  }, [apiArticles]);

  const isRTL = language === "ar";

  const filteredAndSortedArticles = useMemo(() => {
    // Use transformed API articles if available, otherwise fallback to hardcoded data
    let filtered = transformedArticles.length > 0 ? transformedArticles : articles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (article: any) =>
          (article.translations?.title || article.title?.[language] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (article.translations?.content || article.content?.[language] || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category (only applicable to hardcoded articles)
    if (selectedCategory !== "All Categories" && selectedCategory !== "جميع الفئات" && apiArticles.length === 0) {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    // Sort articles
    const sortIndex = sortOptions[language].indexOf(sortBy);
    const sortKey = ["newest", "popular", "rating"][sortIndex] || "newest";

    filtered = [...filtered].sort((a: any, b: any) => {
      switch (sortKey) {
        case "newest":
          return new Date(b.created_at || b.publishDate).getTime() - new Date(a.created_at || a.publishDate).getTime();
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, language, apiArticles]);

  // Pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredAndSortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredAndSortedArticles.length / articlesPerPage);

  const translations = {
    en: {
      title: "Mental Health Articles",
      subtitle: "Expert insights and practical advice for your mental wellness journey",
      search: "Search articles...",
      category: "Category",
      sort: "Sort by",
      noResults: "No articles found",
      noResultsDesc: "Try adjusting your search or filters",
      page: "Page",
      of: "of",
    },
    ar: {
      title: "مقالات الصحة النفسية",
      subtitle: "رؤى الخبراء ونصائح عملية لرحلتك نحو الصحة النفسية",
      search: "ابحث عن مقالات...",
      category: "الفئة",
      sort: "الترتيب حسب",
      noResults: "لم يتم العثور على مقالات",
      noResultsDesc: "جرب تعديل البحث أو التصفية",
      page: "صفحة",
      of: "من",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background  via-primary/10 to-accent/8" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/14 via-secondary/32 via-accent/10 to-background/95 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4" dir={isRTL ? "rtl" : "ltr"}>
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border bg-secondary/25">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto w-full">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
              <Input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? "pr-10 text-right" : "pl-10"}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* Category and Sort Filters */}
            <div className={`flex flex-col sm:flex-row gap-4 items-center justify-center ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-2 w-full sm:w-auto ${isRTL ? "flex-row-reverse" : ""}`}>
                <label className="text-sm font-medium whitespace-nowrap">{t.category}:</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]" dir={isRTL ? "rtl" : "ltr"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[language].map((cat) => (
                      <SelectItem key={cat} value={cat} dir={isRTL ? "rtl" : "ltr"}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={`flex items-center gap-2 w-full sm:w-auto ${isRTL ? "flex-row-reverse" : ""}`}>
                <label className="text-sm font-medium whitespace-nowrap">{t.sort}:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]" dir={isRTL ? "rtl" : "ltr"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions[language].map((option) => (
                      <SelectItem key={option} value={option} dir={isRTL ? "rtl" : "ltr"}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{language === "ar" ? "جارٍ تحميل المقالات..." : "Loading articles..."}</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchArticles} variant="outline">
                {language === "ar" ? "إعادة المحاولة" : "Try Again"}
              </Button>
            </div>
          ) : currentArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                {currentArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} language={language} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-center gap-2 mt-12 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {isRTL ? "→" : "←"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t.page} {currentPage} {t.of} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {isRTL ? "←" : "→"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold mb-2" dir={isRTL ? "rtl" : "ltr"}>
                {t.noResults}
              </h3>
              <p className="text-muted-foreground" dir={isRTL ? "rtl" : "ltr"}>
                {t.noResultsDesc}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Articles;
