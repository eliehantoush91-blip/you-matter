import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { useToast } from "@/hooks/use-toast";

interface QuestionData {
  id: number;
  order: number;
  test: {
    id: number;
    translations: {
      en: { name: string };
      ar: { name: string };
    };
    test_type: string;
    estimated_time: string;
  };
  translations: {
    en: { text: string };
    ar: { text: string };
  };
  choices: Array<{
    id: number;
    score: number;
    translations: {
      en: { text: string };
      ar: { text: string };
    };
  }>;
}

interface TestData {
  id: number;
  translations: {
    en: {
      name: string;
    };
    ar: {
      name: string;
    };
  };
  test_type: string;
}

// Mock questions data - fallback if API fails
const testQuestions: Record<string, { name: string; questions: string[] }> = {
  "1": {
    name: "Beck Depression Inventory (BDI)",
    questions: [
      "I feel sad or down most of the time.",
      "I feel pessimistic about the future.",
      "I feel like a failure.",
      "I get less pleasure from things I used to enjoy.",
      "I feel guilty about things I've done or should have done.",
      "I feel I am being punished.",
      "I am disappointed in myself.",
      "I am more critical of myself than I used to be.",
      "I have thoughts of harming myself.",
      "I cry more than I used to.",
      "I feel more restless or agitated than usual.",
      "I have lost interest in other people or activities.",
      "I find it harder to make decisions than before.",
      "I feel less worthwhile than I used to.",
      "I have less energy than I used to.",
      "My sleep patterns have changed.",
      "I feel more irritable than usual.",
      "My appetite has changed significantly.",
      "I find it hard to concentrate.",
      "I feel more tired or fatigued than usual.",
      "I have lost interest in intimate relationships.",
    ],
  },
  "2": {
    name: "Generalized Anxiety Disorder Assessment (GAD-7)",
    questions: [
      "I feel nervous, anxious, or on edge.",
      "I am unable to stop or control worrying.",
      "I worry too much about different things.",
      "I have trouble relaxing.",
      "I am so restless that it's hard to sit still.",
      "I become easily annoyed or irritable.",
      "I feel afraid as if something awful might happen.",
    ],
  },
  "3": {
    name: "Big Five Personality Test",
    questions: [
      "I see myself as someone who is talkative.",
      "I see myself as someone who tends to find fault with others.",
      "I see myself as someone who does a thorough job.",
      "I see myself as someone who is depressed, blue.",
      "I see myself as someone who is original, comes up with new ideas.",
      "I see myself as someone who is reserved.",
      "I see myself as someone who is helpful and unselfish with others.",
      "I see myself as someone who can be somewhat careless.",
      "I see myself as someone who is relaxed, handles stress well.",
      "I see myself as someone who is curious about many different things.",
    ],
  },
  "4": {
    name: "Emotional Intelligence Assessment",
    questions: [
      "I am aware of my emotions as I experience them.",
      "I can easily identify what I am feeling at any given moment.",
      "I understand how my emotions affect my thoughts.",
      "I can manage my impulses and distressing emotions well.",
      "I remain calm and clear-headed under high stress.",
      "I am optimistic and see the positive side of things.",
      "I can sense other people's emotions easily.",
      "I am good at reading body language and nonverbal cues.",
      "I handle conflicts and disagreements constructively.",
      "I inspire and guide others effectively.",
    ],
  },
};

const TestTaking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);
  const { language: globalLang } = useLanguage();
  const language = globalLang === 'ar' ? 'ar' : 'en';
  const isRTL = language === 'ar';


  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, {id: number, score: number}>>({});

  // Fallback to hardcoded data
  const fallbackTest = id ? testQuestions[id] : null;
  const test = testData ? {
    name: (language === 'ar' ? testData.translations?.ar?.name : null) ||
          testData.translations?.en?.name ||
          (language === 'ar' ? testData.translations?.en?.name : null) ||
          fallbackTest?.name || 'Test',
    questions: questions.map(q =>
      (language === 'ar' ? q.translations?.ar?.text : null) ||
      q.translations?.en?.text ||
      (language === 'ar' ? q.translations?.en?.text : null) ||
      'Question'
    )
  } : fallbackTest;

  const fetchTestData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch test details
      const testResponse = await axios.get(`http://127.0.0.1:8000/api/test_details/${id}/`, {
        params: { language: globalLang }
      });
      setTestData(testResponse.data);

      // Fetch questions if it's a static or dynamic test
      if (testResponse.data.test_type === 'static') {
        const questionsResponse = await axios.get(`http://127.0.0.1:8000/api/questions_static/${id}/`, {
          params: { language: globalLang }
        });
        setQuestions(questionsResponse.data);
      } else if (testResponse.data.test_type === 'dynamic') {
        const questionsResponse = await axios.get(`http://127.0.0.1:8000/api/questions_dynamic/${id}/`, {
          params: { language: globalLang }
        });
        setQuestions(questionsResponse.data);
      }
    } catch (err: any) {
      console.error('Error fetching test data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load test data';
      setError(errorMessage);
      // Don't set error state, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  const submitTestResult = async () => {
    try {
      const token = auth.token;
      if (!token) {
        console.warn('No auth token available for result submission');
        return;
      }

      // Calculate total score (sum of all answer scores)
      const totalScore = Object.values(answers).reduce((sum, answer) => {
        const score = Number(answer?.score) || 0;
        return sum + score;
      }, 0);

      // Ensure totalScore is a valid number
      const safeTotalScore = isNaN(totalScore) || totalScore === null || totalScore === undefined ? 0 : Math.max(0, totalScore);

      const resultText = `${test?.name || 'Test'} Results:
Total Questions: ${questions.length}
Total Score: ${safeTotalScore}
Completed at: ${new Date().toLocaleString()}`;

      await axios.post('http://127.0.0.1:8000/api/submit_result/', {
        test_id: id,
        score: safeTotalScore,
        result_text: resultText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast({
        title: language === 'ar' ? "تم حفظ النتائج!" : "Results Saved!",
        description: language === 'ar' ? "تم حفظ نتائج اختبارك بنجاح." : "Your test results have been saved successfully.",
      });
    } catch (error) {
      console.error('Error submitting result:', error);
      toast({
        variant: "destructive",
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حفظ النتائج. يرجى المحاولة مرة أخرى." : "Failed to save your results. Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchTestData();
  }, [id, globalLang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'جاري تحميل الاختبار...' : 'Loading test...'}
          </p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Test Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = test.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentAnswer = answers[currentQuestion]?.id;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const answeredCount = Object.keys(answers).length;

  const handleAnswerSelect = (score: number, id: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: { id, score } }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    await submitTestResult();
    navigate('/test-results');
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/tests`)}
              className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {language === 'ar' ? 'خروج' : 'Exit'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {language === 'ar'
                ? `${answeredCount} من ${totalQuestions} تم الإجابة عليها`
                : `${answeredCount} of ${totalQuestions} answered`
              }
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
          {/* Question Card */}
          <Card className="flex-1 flex flex-col shadow-lg">
            <CardHeader className="pb-4">
              <p className={`text-sm text-muted-foreground mb-2 ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar'
                  ? `السؤال ${currentQuestion + 1}`
                  : `Question ${currentQuestion + 1}`
                }
              </p>
              <CardTitle className={`text-xl md:text-2xl font-serif leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                {test.questions[currentQuestion]}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-center">
              {/* Answer Options */}
              <div className="space-y-3">
                {questions[currentQuestion]?.choices?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.score, option.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                      "hover:border-primary/50 hover:bg-accent/50",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      currentAnswer === option.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          currentAnswer === option.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {currentAnswer === option.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                        )}
                      </div>
                      <span className="font-medium">
                        {(language === 'ar' ? option.translations?.ar?.text : null) ||
                         option.translations?.en?.text ||
                         (language === 'ar' ? option.translations?.en?.text : null) ||
                         'Choice'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className={`flex items-center justify-between mt-6 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions}
                className={`gap-2 px-8 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {language === 'ar' ? 'إرسال الاختبار' : 'Submit Test'}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentAnswer === undefined}
                className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {language === 'ar' ? 'التالي' : 'Next'}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>

          {/* Hint text */}
          {isLastQuestion && answeredCount < totalQuestions && (
            <p className={`text-center text-sm text-muted-foreground mt-4 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar'
                ? 'يرجى الإجابة على جميع الأسئلة قبل الإرسال.'
                : 'Please answer all questions before submitting.'
              }
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default TestTaking;
