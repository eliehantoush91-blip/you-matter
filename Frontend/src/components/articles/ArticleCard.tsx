import { Article, Language } from "@/types/article";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface ArticleCardProps {
  article: Article;
  language: Language;
}

const ArticleCard = ({ article, language }: ArticleCardProps) => {
  const isRTL = language === "ar";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === "en" 
      ? date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : date.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="aspect-video overflow-hidden">
        <img
          src={article.image}
          alt={article.title[language]}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-xl" dir={isRTL ? "rtl" : "ltr"}>
          {article.title[language]}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-base" dir={isRTL ? "rtl" : "ltr"}>
          {article.description[language]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex flex-wrap gap-3 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            <User className="w-4 h-4" />
            <span dir={isRTL ? "rtl" : "ltr"}>{article.author.name[language]}</span>
          </div>
          <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.publishDate)}</span>
          </div>
          <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Clock className="w-4 h-4" />
            <span>
              {article.readTime} {language === "en" ? "min read" : "دقيقة"}
            </span>
          </div>
        </div>
        <Link to={`/articles/${article.id}`}>
          <Button variant="gradient" className="w-full" dir={isRTL ? "rtl" : "ltr"}>
            {language === "en" ? "Read More" : "اقرأ المزيد"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
