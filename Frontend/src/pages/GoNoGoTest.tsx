import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrialResult {
  trialNumber: number;
  stimulusType: "go" | "nogo";
  responded: boolean;
  reactionTime: number | null;
  correct: boolean;
}

type GamePhase = "instructions" | "countdown" | "trial" | "feedback" | "results";

const TOTAL_TRIALS = 30;
const STIMULUS_DURATION = 1500; // ms
const INTER_TRIAL_INTERVAL = 1000; // ms
const GO_RATIO = 0.7; // 70% go trials

const GoNoGoTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);
  const { t } = useLanguage();

  // Game state
  const [phase, setPhase] = useState<GamePhase>("instructions");
  const [trials, setTrials] = useState<("go" | "nogo")[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  
  // Initialize trials when component mounts
  useEffect(() => {
    const goCount = Math.round(TOTAL_TRIALS * GO_RATIO);
    const nogoCount = TOTAL_TRIALS - goCount;
    const sequence: ("go" | "nogo")[] = [
      ...Array(goCount).fill("go" as const),
      ...Array(nogoCount).fill("nogo" as const),
    ];
    // Shuffle
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }
    setTrials(sequence);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === "countdown" && countdown === 0) {
      startTrial();
    }
  }, [phase, countdown]);

  // Trial timeout effect
  useEffect(() => {
    if (phase === "trial" && trials.length > 0) {
      const timer = setTimeout(() => {
        endTrial(false); // No response
      }, STIMULUS_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase, currentTrialIndex, trials]);

  const startTrial = () => {
    if (currentTrialIndex >= TOTAL_TRIALS) {
      setPhase("results");
      return;
    }

    setTrialStartTime(Date.now());
    setPhase("trial");
  };

  const handleResponse = () => {
    if (phase !== "trial") return;
    endTrial(true); // User responded
  };

  const endTrial = (responded: boolean) => {
    if (phase !== "trial") return;

    const stimulusType = trials[currentTrialIndex];
    const reactionTime = responded ? Date.now() - trialStartTime : null;
    const isGo = stimulusType === "go";
    const correct = isGo ? responded : !responded;

    const result: TrialResult = {
      trialNumber: currentTrialIndex + 1,
      stimulusType,
      responded,
      reactionTime,
      correct,
    };

    setResults(prev => [...prev, result]);
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");

    // Move to next trial after delay
    setTimeout(() => {
      setFeedback(null);
      setCurrentTrialIndex(prev => {
        const next = prev + 1;
        if (next < TOTAL_TRIALS) {
          startTrial();
      } else {
        setPhase("results");
      }
        return next;
      });
    }, INTER_TRIAL_INTERVAL);
  };

  const startTest = () => {
    setPhase("countdown");
    setCountdown(3);
    setCurrentTrialIndex(0);
    setResults([]);
    setFeedback(null);
  };

  const restartTest = () => {
    setPhase("instructions");
    setCurrentTrialIndex(0);
    setCountdown(3);
    setResults([]);
    setFeedback(null);
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (phase === "instructions") {
          startTest();
        } else if (phase === "trial") {
          handleResponse();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase]);

  // Calculate results
  const calculateResults = () => {
    const goTrials = results.filter((r) => r.stimulusType === "go");
    const nogoTrials = results.filter((r) => r.stimulusType === "nogo");
    
    const correctGo = goTrials.filter((r) => r.correct).length;
    const correctNogo = nogoTrials.filter((r) => r.correct).length;
    const commissionErrors = nogoTrials.filter((r) => r.responded).length;
    const omissionErrors = goTrials.filter((r) => !r.responded).length;
    
    const validReactionTimes = goTrials
      .filter((r) => r.responded && r.reactionTime)
      .map((r) => r.reactionTime as number);
    
    const avgReactionTime = validReactionTimes.length > 0
      ? Math.round(validReactionTimes.reduce((a, b) => a + b, 0) / validReactionTimes.length)
      : 0;

    const accuracy = Math.round((results.filter((r) => r.correct).length / TOTAL_TRIALS) * 100);

    return {
      accuracy,
      avgReactionTime,
      correctGo,
      correctNogo,
      commissionErrors,
      omissionErrors,
      totalGo: goTrials.length,
      totalNogo: nogoTrials.length,
    };
  };

  const submitResult = async (stats: any) => {
    try {
      const token = auth.token;
      if (!token) {
        console.warn('No auth token available for result submission');
        return;
      }

      const resultText = `${t('نتائج اختبار الذهاب/عدم الذهاب', 'Go/No-Go Test Results')}:
${t('الدقة', 'Accuracy')}: ${stats.accuracy}%
${t('متوسط وقت التفاعل', 'Average Reaction Time')}: ${stats.avgReactionTime}ms
${t('تجارب الذهاب الصحيحة', 'Go Trials')}: ${stats.correctGo}/${stats.totalGo} ${t('صحيحة', 'correct')}
${t('تجارب عدم الذهاب الصحيحة', 'No-Go Trials')}: ${stats.correctNogo}/${stats.totalNogo} ${t('صحيحة', 'correct')}
${t('أخطاء الالتزام', 'Commission Errors')}: ${stats.commissionErrors}
${t('أخطاء الإغفال', 'Omission Errors')}: ${stats.omissionErrors}`;

      await axios.post('http://127.0.0.1:8000/api/submit_result/', {
        test_id: 2, // Go/No-Go test ID
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

  const progress = ((currentTrialIndex + 1) / TOTAL_TRIALS) * 100;

  // Submit result when test completes
  useEffect(() => {
    if (phase === "results" && results.length === TOTAL_TRIALS) {
      const stats = calculateResults();
      submitResult(stats);
    }
  }, [phase, results]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("خروج", "Exit")}
            </Button>
            {phase === "trial" || phase === "feedback" ? (
              <span className="text-sm text-muted-foreground">
                {t("التجربة", "Trial")} {currentTrialIndex + 1} {t("من", "of")} {TOTAL_TRIALS}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {/* Progress Bar - only show during game */}
      {(phase === "trial" || phase === "feedback") && (
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        {/* Instructions */}
        {phase === "instructions" && (
          <Card className="max-w-lg w-full text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">{t("اختبار الذهاب/عدم الذهاب", "Go/No-Go Test")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-left">
                <p className="text-muted-foreground">
                  {t("يقيس هذا الاختبار قدرتك على الاستجابة بسرعة وكبح الاستجابات.", "This test measures your ability to respond quickly and inhibit responses.")}
                </p>
                <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t("الدائرة الخضراء = ذهاب", "Green Circle = GO")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("اضغط SPACE أو المس بأسرع ما يمكن", "Press SPACE or tap as fast as you can")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t("الدائرة الحمراء = عدم ذهاب", "Red Circle = NO-GO")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("لا تستجب. انتظر التجربة التالية.", "Do NOT respond. Wait for the next trial.")}
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={startTest} className="gap-2">
                <Play className="h-4 w-4" />
                {t("ابدأ الاختبار", "Start Test")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("اضغط SPACE لبدء الاختبار", "Press SPACE to start")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Countdown */}
        {phase === "countdown" && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t("استعد...", "Get ready...")}</p>
            <div className="text-8xl font-bold text-primary animate-scale-in">
              {countdown}
            </div>
          </div>
        )}

        {/* Trial / Feedback */}
        {(phase === "trial" || phase === "feedback") && (
          <div
            className="w-full max-w-md aspect-square flex items-center justify-center cursor-pointer select-none"
          >
            {phase === "trial" ? (
              <div
                className={cn(
                  "w-40 h-40 md:w-48 md:h-48 rounded-full animate-scale-in transition-transform cursor-pointer",
                  trials[currentTrialIndex] === "go" ? "bg-green-500" : "bg-red-500"
                )}
                onClick={handleResponse}
              />
            ) : feedback ? (
              <div
                className={cn(
                  "text-2xl font-medium animate-fade-in",
                  feedback === "correct" ? "text-green-500" : "text-red-500"
                )}
              >
                {feedback === "correct" ? "✓" : "✗"}
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
            )}
          </div>
        )}

        {/* Results */}
        {phase === "results" && (
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-serif">{t("انتهى الاختبار!", "Test Complete!")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const stats = calculateResults();
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-accent/50 rounded-lg">
                        <p className="text-3xl font-bold text-primary">{stats.accuracy}%</p>
                        <p className="text-sm text-muted-foreground">{t("الدقة", "Accuracy")}</p>
                      </div>
                      <div className="text-center p-4 bg-accent/50 rounded-lg">
                        <p className="text-3xl font-bold text-primary">{stats.avgReactionTime}ms</p>
                        <p className="text-sm text-muted-foreground">{t("متوسط وقت التفاعل", "Avg. Reaction Time")}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">{t("تجارب الذهاب الصحيحة", "Go Trials Correct")}</span>
                        <span className="font-medium">{stats.correctGo}/{stats.totalGo}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">{t("تجارب عدم الذهاب الصحيحة", "No-Go Trials Correct")}</span>
                        <span className="font-medium">{stats.correctNogo}/{stats.totalNogo}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">{t("أخطاء الالتزام", "Commission Errors")}</span>
                        <span className="font-medium text-destructive">{stats.commissionErrors}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">{t("أخطاء الإغفال", "Omission Errors")}</span>
                        <span className="font-medium text-destructive">{stats.omissionErrors}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={restartTest} className="flex-1 gap-2">
                        <RotateCcw className="h-4 w-4" />
                        {t("حاول مرة أخرى", "Try Again")}
                      </Button>
                      <Button onClick={() => navigate("/")} className="flex-1">
                        {t("العودة للاختبارات", "Back to Tests")}
                      </Button>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Touch hint during game */}
      {(phase === "trial" || phase === "feedback") && (
        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground">
            {t("المس الشاشة أو اضغط SPACE للاستجابة", "Tap the screen or press SPACE to respond")}
          </p>
        </div>
      )}
    </div>
  );
};

export default GoNoGoTest;
