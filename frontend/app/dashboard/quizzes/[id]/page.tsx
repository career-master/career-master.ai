'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks?: number;
  negativeMarks?: number;
}

interface QuizData {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

function QuizAttemptContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [hasShownTimeAlert, setHasShownTimeAlert] = useState(false);
  const submitLock = useRef(false);

  // Helper functions for localStorage timer
  const getTimerKey = (userEmail: string, quizId: string) => `quiz_timer_${userEmail}_${quizId}`;
  const getEndTimeKey = (userEmail: string, quizId: string) => `quiz_endTime_${userEmail}_${quizId}`;

  const getStoredTimer = (quizTimeLimit: number): number => {
    if (!user?.email) return quizTimeLimit * 60;
    
    const timerKey = getTimerKey(user.email, quizId);
    const endTimeKey = getEndTimeKey(user.email, quizId);
    const storedTime = localStorage.getItem(timerKey);
    
    if (storedTime) {
      const now = Date.now();
      const endTime = parseInt(localStorage.getItem(endTimeKey) || '0');
      if (endTime && now < endTime) {
        return Math.floor((endTime - now) / 1000);
      }
    }
    return quizTimeLimit * 60;
  };

  const storeTimer = (timeLeft: number) => {
    if (!user?.email) return;
    
    const timerKey = getTimerKey(user.email, quizId);
    const endTimeKey = getEndTimeKey(user.email, quizId);
    const endTime = Date.now() + (timeLeft * 1000);
    localStorage.setItem(timerKey, timeLeft.toString());
    localStorage.setItem(endTimeKey, endTime.toString());
  };

  const clearStoredTimer = () => {
    if (!user?.email) return;
    
    const timerKey = getTimerKey(user.email, quizId);
    const endTimeKey = getEndTimeKey(user.email, quizId);
    localStorage.removeItem(timerKey);
    localStorage.removeItem(endTimeKey);
  };

  // Enter fullscreen
  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
      setIsFullscreen(false);
    }
  };

  // Exit fullscreen
  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  };

  // Load quiz details
  useEffect(() => {
    if (!quizId) return;
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiService.getQuizById(quizId);
        if (res.success && res.data) {
          const data: any = res.data;
          setQuiz(data);
          const durationMinutes = data.durationMinutes || 30;
          const initialTimeLeft = getStoredTimer(durationMinutes);
          setTimeLeft(initialTimeLeft);
          storeTimer(initialTimeLeft);
          
          // Try to enter fullscreen
          try {
            await enterFullscreen();
          } catch (err) {
            console.log('Fullscreen not available');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId, user?.email]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    
    if (timeLeft <= 0) {
      clearStoredTimer();
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          clearStoredTimer();
          handleSubmit(true);
          return 0;
        }
        const newTime = prev - 1;
        storeTimer(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // 5-minute warning
  useEffect(() => {
    if (timeLeft !== null && timeLeft === 300 && !hasShownTimeAlert) {
      setShowTimeWarning(true);
      setHasShownTimeAlert(true);
      setTimeout(() => {
        setShowTimeWarning(false);
      }, 5000);
    }
  }, [timeLeft, hasShownTimeAlert]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quiz && !loading) {
        toast.error('Please do not switch tabs or minimize the window during the test');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quiz, loading]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && 
          !(document as any).webkitFullscreenElement && 
          !(document as any).msFullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Prevent navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (!quiz) return;
    // Mark question as skipped
    if (!skippedQuestions.includes(currentQuestion)) {
      setSkippedQuestions(prev => [...prev, currentQuestion]);
    }
    // Clear answer if any
    setAnswers(prev => ({ ...prev, [currentQuestion]: null }));
    // Move to next question
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!quiz || submitted || submitting || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);

    try {
      if (!user?.email) {
        toast.error('User email not found');
        return;
      }

      // Calculate time spent
      const initialTime = quiz.durationMinutes * 60;
      const timeSpentInSeconds = initialTime - (timeLeft || 0);

      // Convert answers to the format expected by backend (question index to option index)
      const formattedAnswers: Record<string, number> = {};
      Object.keys(answers).forEach((key) => {
        const qIndex = parseInt(key);
        const optionIndex = answers[qIndex];
        if (optionIndex !== null && optionIndex !== undefined) {
          formattedAnswers[qIndex.toString()] = optionIndex;
        }
      });

      const res = await apiService.submitQuizAttempt(quizId, {
        email: user.email,
        answers: formattedAnswers,
        timeSpentInSeconds
      });

      if (res.success && res.data) {
        clearStoredTimer();
        setSubmitted(true);
        toast.success('Quiz submitted successfully!');

        // Exit fullscreen
        try {
          if (document.fullscreenElement) {
            exitFullscreen();
          }
        } catch (err) {
          console.error('Error exiting fullscreen:', err);
        }

        // Show results modal
        const attempt = res.data.attempt;
        const thankYouModal = document.createElement('div');
        thankYouModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        thankYouModal.innerHTML = `
          <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 animate-fade-in">
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p class="text-gray-600 mb-4">Your quiz has been submitted successfully.</p>
              <div class="text-left bg-gray-50 p-4 rounded-lg mb-4">
                <p class="text-sm text-gray-600">Marks Obtained: <span class="font-semibold">${attempt.marksObtained}</span></p>
                <p class="text-sm text-gray-600">Total Marks: <span class="font-semibold">${attempt.totalMarks}</span></p>
                <p class="text-sm text-gray-600">Percentage: <span class="font-semibold">${attempt.percentage.toFixed(2)}%</span></p>
                <p class="text-sm text-gray-600">Result: <span class="font-semibold ${attempt.result === 'pass' ? 'text-green-600' : 'text-red-600'}">${attempt.result.toUpperCase()}</span></p>
                <p class="text-sm text-gray-600">Correct Answers: ${attempt.correctAnswers}</p>
                <p class="text-sm text-gray-600">Incorrect Answers: ${attempt.incorrectAnswers}</p>
                <p class="text-sm text-gray-600">Unattempted: ${attempt.unattemptedAnswers}</p>
              </div>
              <p class="text-sm text-gray-500">Redirecting to quizzes page...</p>
            </div>
          </div>
        `;
        document.body.appendChild(thankYouModal);

        // Redirect after 3 seconds
        setTimeout(() => {
          document.body.removeChild(thankYouModal);
          router.push('/dashboard/quizzes');
        }, 3000);
      } else {
        throw new Error(res.error?.message || 'Failed to submit quiz');
      }
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit quiz');
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Quiz not found'}</p>
          <button
            onClick={() => router.push('/dashboard/quizzes')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const answeredQuestions = Object.values(answers).filter(a => a !== null && a !== undefined).length;
  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Fullscreen Button */}
      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          className="fixed top-4 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-lg"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          Enter Fullscreen
        </button>
      )}

      {/* Time Warning Toast */}
      {showTimeWarning && (
        <div className="fixed top-16 right-4 z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="bg-white rounded-lg p-4 shadow-lg border-l-4 border-red-500 max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-800">Time Running Out!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Only 5 minutes remaining to complete your quiz.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-96 bg-gray-900 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
        
        {/* Legend */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-1">
            <span className="inline-block h-5 w-5 rounded-md bg-green-500"></span>
            <span className="text-xs text-white">Attempted</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-5 w-5 rounded-md bg-yellow-500"></span>
            <span className="text-xs text-white">Skipped</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-5 w-5 rounded-md bg-gray-500"></span>
            <span className="text-xs text-white">Unattempted</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm uppercase mb-2">Questions Status</h2>
          <div className="space-y-2">
            <div className="text-2xl font-bold flex items-center">
              <span className="text-purple-400">{answeredQuestions}</span>
              <span className="text-sm ml-1">/ {totalQuestions} answered</span>
            </div>
            {skippedQuestions.length > 0 && (
              <div className="text-sm text-yellow-400">
                {skippedQuestions.length} skipped
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <h2 className="text-sm uppercase mb-3">Question Navigation</h2>
          <div className="grid grid-cols-6 gap-2">
            {quiz.questions.map((question, questionIndex) => {
              const isAnswered = answers[questionIndex] !== null && answers[questionIndex] !== undefined;
              const bgColor = isAnswered ? "bg-green-500" : "bg-gray-700";
              const content = isAnswered ? "✓" : (questionIndex + 1).toString();
              
              return (
                <button
                  key={questionIndex}
                  onClick={() => setCurrentQuestion(questionIndex)}
                  className={`${bgColor} h-10 w-10 rounded-md flex items-center justify-center font-medium transition-colors ${
                    currentQuestion === questionIndex
                      ? "ring-2 ring-purple-400"
                      : ""
                  }`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          onClick={() => handleSubmit(false)}
          disabled={submitted || submitting}
        >
          {submitted ? 'Quiz Submitted' : submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6">
        {/* Timer */}
        <div className="mb-4 p-3 rounded-md flex flex-col items-center" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="flex items-center">
            <span className="inline-block mr-2">
              <svg className="h-7 w-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className={`text-3xl font-bold tracking-wide ${
              timeLeft !== null && timeLeft <= 60 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="mt-2 text-xs font-semibold text-gray-500 tracking-widest uppercase">Time Left</span>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestion + 1} of {totalQuestions}
              </h2>
              <p className="text-lg mb-6 text-gray-800">{currentQ.questionText}</p>

              <div className="space-y-3">
                {currentQ.options.map((option, optIndex) => {
                  const selected = answers[currentQuestion] === optIndex;
                  return (
                    <label
                      key={optIndex}
                      className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                        selected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={optIndex}
                        checked={selected}
                        onChange={() => handleOptionSelect(currentQuestion, optIndex)}
                        className="hidden"
                      />
                      <span className="text-gray-900">{String.fromCharCode(65 + optIndex)}. {option}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion]: null }))}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={currentQuestion === totalQuestions - 1}
                  className="border border-yellow-500 text-yellow-600 px-4 py-2 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentQuestion === totalQuestions - 1}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizAttemptPage() {
  return (
    <ProtectedRoute>
      <QuizAttemptContent />
    </ProtectedRoute>
  );
}
