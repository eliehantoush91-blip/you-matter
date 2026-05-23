import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Moon, AlertCircle, Zap, Users, Target, RefreshCw, ArrowLeft } from "lucide-react";

const PsychologicalTests = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const tests = [
    {
      icon: Brain,
      titleAr: "اختبار الاكتئاب",
      titleEn: "Depression Test",
      descriptionAr: "قائمة بيك للاكتئاب - قيّم أعراض الاكتئاب وشدتها",
      descriptionEn: "Beck Depression Inventory-II - Assess depression symptoms and severity",
      link: "/tests/depression",
      color: "text-blue-500",
    },
    {
      icon: Heart,
      titleAr: "اختبار القلق العام",
      titleEn: "Generalized Anxiety Test",
      descriptionAr: "مقياس GAD-7 - تعرف على مستوى القلق لديك",
      descriptionEn: "GAD-7 Scale - Identify your anxiety level",
      link: "/tests/anxiety",
      color: "text-red-500",
    },
    {
      icon: AlertCircle,
      titleAr: "اختبار اضطراب ما بعد الصدمة",
      titleEn: "PTSD Test",
      descriptionAr: "مقياس PCL-5 - فحص أعراض اضطراب ما بعد الصدمة",
      descriptionEn: "PCL-5 Scale - Screen for PTSD symptoms",
      link: "/tests/ptsd",
      color: "text-orange-500",
    },
    {
      icon: Zap,
      titleAr: "اختبار الاضطراب ثنائي القطب",
      titleEn: "Bipolar Disorder Test",
      descriptionAr: "استبيان MDQ - تقييم أعراض الاضطراب ثنائي القطب",
      descriptionEn: "MDQ Questionnaire - Assess bipolar disorder symptoms",
      link: "/tests/bipolar",
      color: "text-yellow-500",
    },
    {
      icon: Users,
      titleAr: "اختبار القلق الاجتماعي",
      titleEn: "Social Anxiety Test",
      descriptionAr: "مقياس ليبويتز للقلق الاجتماعي - قيّم مستوى القلق الاجتماعي لديك",
      descriptionEn: "Liebowitz Social Anxiety Scale - Evaluate your social anxiety level",
      link: "/tests/social-anxiety",
      color: "text-purple-500",
    },
    {
      icon: Moon,
      titleAr: "اختبار الأرق واضطرابات النوم",
      titleEn: "Insomnia Test",
      descriptionAr: "مقياس أثينا للأرق - اكتشف جودة نومك وأنماطه",
      descriptionEn: "Athens Insomnia Scale - Discover your sleep quality and patterns",
      link: "/tests/insomnia",
      color: "text-indigo-500",
    },
    {
      icon: Target,
      titleAr: "اختبار اضطراب الشخصية الحدية",
      titleEn: "Borderline Personality Test",
      descriptionAr: "مقياس MSI-BPD - فحص أعراض اضطراب الشخصية الحدية",
      descriptionEn: "MSI-BPD Scale - Screen for borderline personality symptoms",
      link: "/tests/borderline",
      color: "text-pink-500",
    },
    {
      icon: RefreshCw,
      titleAr: "اختبار الوسواس القهري",
      titleEn: "OCD Test",
      descriptionAr: "مقياس Y-BOCS - تقييم أعراض الوسواس القهري",
      descriptionEn: "Y-BOCS Scale - Assess obsessive-compulsive symptoms",
      link: "/tests/ocd",
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/40 via-primary/10 to-accent/8">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/patient-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="rotate-180" />
            {t("العودة إلى لوحة التحكم", "Back to Dashboard")}
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2">
            {t("الاختبارات النفسية", "Psychological Tests")}
          </h1>
          <p className="text-muted-foreground mb-4">
            {t(
              "اختبارات نفسية علمية مبنية على معايير عالمية لمساعدتك في فهم حالتك النفسية بشكل أفضل",
              "Scientific psychological tests based on international standards to help you better understand your mental state"
            )}
          </p>
          
          {/* Disclaimer */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 border border-accent/30">
            <AlertCircle className="w-4 h-4 text-accent-foreground" />
            <p className="text-sm text-accent-foreground">
              {t(
                "هذه الاختبارات ليست تشخيصاً طبياً. استشر متخصصاً إذا كانت النتائج مقلقة",
                "These tests are not a medical diagnosis. Consult a professional if results are concerning"
              )}
            </p>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tests.map((test, index) => {
            const IconComponent = test.icon;
            return (
              <Card
                key={index}
                className="fade-in cursor-pointer hover:shadow-elegant transition-smooth hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(test.link)}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${test.color}`}>
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {t(test.titleAr, test.titleEn)}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {t(test.descriptionAr, test.descriptionEn)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {t("ابدأ الاختبار", "Start Test")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="mt-12 shadow-card border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle>{t("لماذا الاختبارات النفسية مهمة؟", "Why Are Psychological Tests Important?")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "الاختبارات النفسية هي أدوات علمية موثوقة تساعدك على فهم حالتك النفسية بشكل أفضل. هذه الاختبارات مبنية على معايير عالمية وتم التحقق من صحتها من قبل خبراء في الصحة النفسية.",
                "Psychological tests are reliable scientific tools that help you better understand your mental state. These tests are based on international standards and have been validated by mental health experts."
              )}
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-2 text-primary">
                  {t("موثوقة علمياً", "Scientifically Validated")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "جميع الاختبارات مبنية على أبحاث علمية معترف بها",
                    "All tests are based on recognized scientific research"
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-2 text-primary">
                  {t("سرية تامة", "Completely Confidential")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "نتائجك خاصة بك ولا يتم مشاركتها مع أي طرف ثالث",
                    "Your results are private and not shared with any third party"
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-2 text-primary">
                  {t("سهلة الاستخدام", "Easy to Use")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "واجهة بسيطة وسهلة الفهم تناسب جميع المستخدمين",
                    "Simple and easy-to-understand interface suitable for all users"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PsychologicalTests;
