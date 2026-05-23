import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RootState } from "@/Redux/store";

interface BigFiveQuestion {
  id: number;
  code: string;
  trait: string;
  order: number;
  reverse_scored: boolean;
  translations: {
    en?: { text: string };
    ar?: { text: string };
  };
}

interface BigFiveSubmitResponse {
  result: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    emotional_stability: number;
    cluster_id: number | null;
    cluster_label: string;
    cluster_label_i18n?: { en: string; ar: string };
    cluster_description: string;
    cluster_description_i18n?: { en: string; ar: string };
  };
  cluster?: {
    id: number;
    label: string;
    label_i18n?: { en: string; ar: string };
    description: string;
    description_i18n?: { en: string; ar: string };
    trait_means?: Record<string, number>;
  };
}

const answerOptions = [
  { value: 1, labelEn: "Disagree", labelAr: "لا أوافق" },
  { value: 2, labelEn: "Slightly disagree", labelAr: "لا أوافق قليلاً" },
  { value: 3, labelEn: "Neutral", labelAr: "محايد" },
  { value: 4, labelEn: "Slightly agree", labelAr: "أوافق قليلاً" },
  { value: 5, labelEn: "Agree", labelAr: "أوافق" },
];

const traitLabels = {
  openness: { en: "Openness", ar: "الانفتاح على التجربة" },
  conscientiousness: { en: "Conscientiousness", ar: "الضمير والتنظيم" },
  extraversion: { en: "Extraversion", ar: "الانبساط" },
  agreeableness: { en: "Agreeableness", ar: "التوافق والتعاون" },
  emotional_stability: { en: "Emotional Stability", ar: "الاستقرار العاطفي" },
};

const BigFiveTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);
  const { language: globalLang } = useLanguage();
  const language = globalLang === "ar" ? "ar" : "en";
  const isRTL = language === "ar";

  const [questions, setQuestions] = useState<BigFiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BigFiveSubmitResponse | null>(null);

  const current = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress = totalQuestions ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const selectedAnswer = current ? answers[current.code] : undefined;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const finalClusterLabel = result
    ? result.cluster?.label_i18n?.[language] ||
      result.result.cluster_label_i18n?.[language] ||
      result.cluster?.label ||
      result.result.cluster_label ||
      (language === "ar" ? "نمط شخصية" : "Personality profile")
    : "";
  const finalClusterDescription = result
    ? result.cluster?.description_i18n?.[language] ||
      result.result.cluster_description_i18n?.[language] ||
      result.cluster?.description ||
      result.result.cluster_description ||
      ""
    : "";
  const traitScores = result
    ? [
        ["openness", result.result.openness],
        ["conscientiousness", result.result.conscientiousness],
        ["extraversion", result.result.extraversion],
        ["agreeableness", result.result.agreeableness],
        ["emotional_stability", result.result.emotional_stability],
      ] as Array<[keyof typeof traitLabels, number]>
    : [];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("http://127.0.0.1:8000/api/big-five/questions/", {
          params: { language: globalLang },
        });
        setQuestions(response.data.questions || []);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load Big Five questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [globalLang]);

  const handleAnswerSelect = (value: number) => {
    if (!current) return;
    setAnswers((previous) => ({ ...previous, [current.code]: value }));
  };

  const handleSubmit = async () => {
    if (!auth.token) {
      toast({
        variant: "destructive",
        title: language === "ar" ? "تسجيل الدخول مطلوب" : "Login required",
        description: language === "ar" ? "يرجى تسجيل الدخول قبل إرسال نتيجتك." : "Please login before submitting your result.",
      });
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post<BigFiveSubmitResponse>(
        "http://127.0.0.1:8000/api/big-five/submit/",
        { answers },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("ggggggggggggggggggggggggg :",response.data)
      setResult(response.data as BigFiveSubmitResponse);
      toast({
        title: language === "ar" ? "تم حفظ النتيجة" : "Results saved",
        description: language === "ar" ? "تم حفظ نتيجة اختبار الشخصية بنجاح." : "Your Big Five profile has been saved successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: language === "ar" ? "فشل الإرسال" : "Submission failed",
        description: err.response?.data?.error || (language === "ar" ? "يرجى المحاولة مرة أخرى." : "Please try again."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري تحميل اختبار الشخصية..." : "Loading Big Five test..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>{language === "ar" ? "اختبار العوامل الخمسة للشخصية" : "Big Five Test"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => navigate("/tests")}>
              {language === "ar" ? "العودة للاختبارات" : "Back to Tests"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate("/tests")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "العودة للاختبارات" : "Back to Tests"}
            </Button>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{language === "ar" ? "نتيجة اختبار الشخصية" : "Big Five Result"}</CardTitle>
                    
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === "ar" ? "النتيجة النهائية للخوارزمية" : "Final personality cluster"}
                  </p>
                  <div className="flex flex-col gap-2">
                   
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "" : "Cluster"} {result.cluster?.label ?? result.result.cluster_label}
                    </p>
                  </div>
                </div>

                {finalClusterDescription && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {finalClusterDescription}
                  </p>
                )}

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {language === "ar"
                    ? "تم استخدام القيم الخمس داخلياً داخل الخوارزمية لحساب هذه النتيجة النهائية."
                    : "The five Big Five trait scores were used internally by the clustering algorithm to calculate this final result."}
                </p>

                <div className="rounded-lg border bg-card p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold">
                      {language === "ar" ? "القيم الخمس" : "Five trait scores"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "هذه القيم هي المدخلات التي استخدمتها الخوارزمية للوصول إلى النتيجة النهائية."
                        : "These scores are the inputs used by the algorithm to calculate the final cluster."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {traitScores.map(([trait, value]) => (
                      <div key={trait} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{traitLabels[trait][language]}</span>
                          <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => navigate("/track-progress")}>
                    {language === "ar" ? "عرض التقدم" : "View Progress"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/tests")}>
                    {language === "ar" ? "العودة للاختبارات" : "Back to Tests"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/tests")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "خروج" : "Exit"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {language === "ar"
                ? `${answeredCount} من ${totalQuestions} تمت الإجابة عليها`
                : `${answeredCount} of ${totalQuestions} answered`}
            </span>
          </div>
        </div>
      </header>

      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
              {currentQuestion + 1}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? `السؤال ${currentQuestion + 1}` : `Question ${currentQuestion + 1}`}
              </p>
              <CardTitle className="text-xl md:text-2xl leading-relaxed">
                {current?.translations?.[language]?.text || current?.translations?.en?.text || "Question"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {answerOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswerSelect(option.value)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                      "hover:border-primary/50 hover:bg-accent/50",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      selectedAnswer === option.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedAnswer === option.value ? "border-primary bg-primary" : "border-muted-foreground/40"
                        )}
                      >
                        {selectedAnswer === option.value && (
                          <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{language === "ar" ? option.labelAr : option.labelEn}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((previous) => previous - 1)}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "السابق" : "Previous"}
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions || submitting}
                className="gap-2 px-8"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {language === "ar" ? "إرسال" : "Submit"}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion((previous) => previous + 1)}
                disabled={selectedAnswer === undefined}
                className="gap-2"
              >
                {language === "ar" ? "التالي" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isLastQuestion && answeredCount < totalQuestions && (
            <p className="text-center text-sm text-muted-foreground">
              {language === "ar" ? "يرجى الإجابة على جميع الأسئلة قبل الإرسال." : "Please answer all questions before submitting."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default BigFiveTest;
