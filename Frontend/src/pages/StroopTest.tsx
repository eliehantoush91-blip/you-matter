import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type ColorName = "red" | "blue" | "green" | "yellow";

interface Trial {
  word: ColorName;
  inkColor: ColorName;
  isCongruent: boolean;
}

interface TrialResult {
  trial: Trial;
  responseTime: number;
  correct: boolean;
  selectedColor: ColorName;
}

const COLORS: ColorName[] = ["red", "blue", "green", "yellow"];
const TOTAL_TRIALS = 30;

const colorStyles: Record<ColorName, string> = {
  red: "text-red-500",
  blue: "text-blue-500",
  green: "text-green-500",
  yellow: "text-yellow-500",
};

const buttonStyles: Record<ColorName, string> = {
  red: "bg-red-500 hover:bg-red-600 text-white",
  blue: "bg-blue-500 hover:bg-blue-600 text-white",
  green: "bg-green-500 hover:bg-green-600 text-white",
  yellow: "bg-yellow-500 hover:bg-yellow-600 text-black",
};

const generateTrials = (): Trial[] => {
  const trials: Trial[] = [];
  
  for (let i = 0; i < TOTAL_TRIALS; i++) {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isCongruent = Math.random() > 0.5;
    const inkColor = isCongruent 
      ? word 
      : COLORS.filter(c => c !== word)[Math.floor(Math.random() * 3)];
    
    trials.push({ word, inkColor, isCongruent });
  }
  
  return trials;
};

const StroopTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"instructions" | "test" | "results">("instructions");
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [showStimulus, setShowStimulus] = useState(false);

  useEffect(() => {
    setTrials(generateTrials());
  }, []);

  const startTest = () => {
    setPhase("test");
    setCurrentTrialIndex(0);
    setResults([]);
    setTimeout(() => {
      setShowStimulus(true);
      setTrialStartTime(Date.now());
    }, 500);
  };

  const handleResponse = useCallback((selectedColor: ColorName) => {
    if (!showStimulus) return;
    
    const responseTime = Date.now() - trialStartTime;
    const currentTrial = trials[currentTrialIndex];
    const correct = selectedColor === currentTrial.inkColor;

    setResults(prev => [...prev, {
      trial: currentTrial,
      responseTime,
      correct,
      selectedColor,
    }]);

    setShowStimulus(false);

    if (currentTrialIndex < TOTAL_TRIALS - 1) {
      setTimeout(() => {
        setCurrentTrialIndex(prev => prev + 1);
        setShowStimulus(true);
        setTrialStartTime(Date.now());
      }, 300);
    } else {
      setPhase("results");
    }
  }, [showStimulus, trialStartTime, trials, currentTrialIndex]);

  const calculateStats = () => {
    const congruentTrials = results.filter(r => r.trial.isCongruent);
    const incongruentTrials = results.filter(r => !r.trial.isCongruent);

    const avgCongruentRT = congruentTrials.length > 0
      ? congruentTrials.filter(r => r.correct).reduce((sum, r) => sum + r.responseTime, 0) / congruentTrials.filter(r => r.correct).length
      : 0;
    
    const avgIncongruentRT = incongruentTrials.length > 0
      ? incongruentTrials.filter(r => r.correct).reduce((sum, r) => sum + r.responseTime, 0) / incongruentTrials.filter(r => r.correct).length
      : 0;

    const stroopEffect = avgIncongruentRT - avgCongruentRT;
    const accuracy = (results.filter(r => r.correct).length / results.length) * 100;
    const congruentAccuracy = congruentTrials.length > 0
      ? (congruentTrials.filter(r => r.correct).length / congruentTrials.length) * 100
      : 0;
    const incongruentAccuracy = incongruentTrials.length > 0
      ? (incongruentTrials.filter(r => r.correct).length / incongruentTrials.length) * 100
      : 0;

    return {
      avgCongruentRT: Math.round(avgCongruentRT),
      avgIncongruentRT: Math.round(avgIncongruentRT),
      stroopEffect: Math.round(stroopEffect),
      accuracy: Math.round(accuracy),
      congruentAccuracy: Math.round(congruentAccuracy),
      incongruentAccuracy: Math.round(incongruentAccuracy),
    };
  };

  const submitResult = async (stats: any) => {
    try {
      const token = auth.token;
      if (!token) {
        console.warn('No auth token available for result submission');
        return;
      }

      const resultText = `${t('نتائج اختبار ستروب', 'Stroop Test Results')}:
${t('الدقة الإجمالية', 'Overall Accuracy')}: ${stats.accuracy}%
${t('تأثير ستروب', 'Stroop Effect')}: ${stats.stroopEffect}ms
${t('التجارب المتطابقة', 'Congruent Trials')}: ${stats.congruentAccuracy}% ${t('دقة', 'accuracy')}
${t('التجارب غير المتطابقة', 'Incongruent Trials')}: ${stats.incongruentAccuracy}% ${t('دقة', 'accuracy')}
${t('متوسط وقت الاستجابة (متطابق)', 'Average Response Time (Congruent)')}: ${stats.avgCongruentRT}ms
${t('متوسط وقت الاستجابة (غير متطابق)', 'Average Response Time (Incongruent)')}: ${stats.avgIncongruentRT}ms`;

      await axios.post('http://127.0.0.1:8000/api/submit_result/', {
        test_id: 3, // Stroop test ID
        score: stats.accuracy,
        result_text: resultText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast({
        title: t("تم حفظ النتيجة!", "Result Saved!"),
        description: t("تم حفظ نتائج اختبارك بنجاح.", "Your test results have been saved successfully."),
      });
    } catch (error) {
      console.error('Error submitting result:', error);
      toast({
        variant: "destructive",
        title: t("خطأ", "Error"),
        description: t("فشل في حفظ نتائجك. يرجى المحاولة مرة أخرى.", "Failed to save your results. Please try again."),
      });
    }
  };

  // Submit result when test completes
  useEffect(() => {
    if (phase === "results" && results.length === TOTAL_TRIALS) {
      const stats = calculateStats();
      submitResult(stats);
    }
  }, [phase, results]);

  const restartTest = () => {
    setTrials(generateTrials());
    setCurrentTrialIndex(0);
    setResults([]);
    setPhase("instructions");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("العودة للاختبارات", "Back to Tests")}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {phase === "instructions" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">{t("اختبار ستروب", "Stroop Test")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t("التعليمات:", "Instructions:")}</h3>
                <p className="text-muted-foreground">
                  {t("ستظهر لك كلمات ألوان (أحمر، أزرق، أخضر، أصفر) مكتوبة بألوان حبر مختلفة.", "You will see color words (RED, BLUE, GREEN, YELLOW) displayed in different ink colors.")}
                </p>
                <p className="text-muted-foreground">
                  {t("مهمتك هي تحديد لون الحبر الذي كتبت به الكلمة، وليس الكلمة نفسها.", "Your task is to identify the")} <strong>{t("لون الحبر", "INK COLOR")}</strong> {t("للكلمة، وليس الكلمة نفسها.", "of the word, NOT the word itself.")}
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm">{t("مثال:", "Example:")}</p>
                  <p className={`text-2xl font-bold ${colorStyles.blue}`}>RED</p>
                  <p className="text-sm text-muted-foreground">
                    {t("الإجابة الصحيحة هي الأزرق (لون الحبر)، وليس الأحمر (الكلمة).", "The correct answer is BLUE (the ink color), not RED (the word).")}
                  </p>
                </div>
                <p className="text-muted-foreground">
                  {t("استجب بأسرع ما يمكن وبدقة. يحتوي الاختبار على", "Respond as quickly and accurately as possible. The test has")} {TOTAL_TRIALS} {t("تجارب.", "trials.")}
                </p>
              </div>
              <Button onClick={startTest} className="w-full" size="lg">
                {t("ابدأ الاختبار", "Start Test")}
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "test" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("التجربة", "Trial")} {currentTrialIndex + 1} {t("من", "of")} {TOTAL_TRIALS}</span>
                <span>{Math.round(((currentTrialIndex + 1) / TOTAL_TRIALS) * 100)}%</span>
              </div>
              <Progress value={((currentTrialIndex + 1) / TOTAL_TRIALS) * 100} />
            </div>

            <Card className="min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center py-12">
                {showStimulus ? (
                  <p className={`text-6xl font-bold uppercase ${colorStyles[trials[currentTrialIndex].inkColor]}`}>
                    {trials[currentTrialIndex].word}
                  </p>
                ) : (
                  <p className="text-4xl text-muted-foreground">+</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              {COLORS.map((color) => (
                <Button
                  key={color}
                  onClick={() => handleResponse(color)}
                  disabled={!showStimulus}
                  className={`h-16 text-lg font-semibold uppercase ${buttonStyles[color]}`}
                >
                  {color}
                </Button>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {t("اضغط على الزر الذي يطابق لون الحبر للكلمة", "Click the button matching the INK COLOR of the word")}
            </p>
          </div>
        )}

        {phase === "results" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">{t("النتائج", "Results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const stats = calculateStats();
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary">{stats.accuracy}%</p>
                      <p className="text-sm text-muted-foreground">{t("الدقة الإجمالية", "Overall Accuracy")}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary">{stats.stroopEffect}ms</p>
                      <p className="text-sm text-muted-foreground">{t("تأثير ستروب", "Stroop Effect")}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">{stats.avgCongruentRT}ms</p>
                      <p className="text-sm text-muted-foreground">{t("وقت الاستجابة المتطابق", "Congruent RT")}</p>
                      <p className="text-xs text-muted-foreground">{stats.congruentAccuracy}% {t("دقيق", "accurate")}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">{stats.avgIncongruentRT}ms</p>
                      <p className="text-sm text-muted-foreground">{t("وقت الاستجابة غير المتطابق", "Incongruent RT")}</p>
                      <p className="text-xs text-muted-foreground">{stats.incongruentAccuracy}% {t("دقيق", "accurate")}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{t("فهم نتائجك", "Understanding Your Results")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("يقيس", "The")} <strong>{t("تأثير ستروب", "Stroop Effect")}</strong> {t("الفرق في وقت الاستجابة بين التجارب المتطابقة (تطابق الكلمة مع لون الحبر) والتجارب غير المتطابقة (تختلف الكلمة عن لون الحبر). التأثير الأكبر يشير إلى تداخل أكبر من معنى الكلمة.", "measures the difference in reaction time between congruent trials (word matches ink color) and incongruent trials (word differs from ink color). A larger effect indicates more interference from the word meaning.")}
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={restartTest} variant="outline" className="flex-1">
                  {t("حاول مرة أخرى", "Try Again")}
                </Button>
                <Button onClick={() => navigate("/")} className="flex-1">
                  {t("العودة للاختبارات", "Back to Tests")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StroopTest;
