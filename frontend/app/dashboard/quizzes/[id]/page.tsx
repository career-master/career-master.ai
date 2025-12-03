'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface QuizQuestion {
  questionType: string;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
  correctAnswers?: string[];
  matchPairs?: Array<{ left: string; right: string }>;
  correctOrder?: string[];
  imageUrl?: string;
  marks?: number;
  negativeMarks?: number;
}

interface QuizData {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  useSections?: boolean;
  sections?: Array<{
    sectionTitle: string;
    questions: QuizQuestion[];
  }>;
  questions?: QuizQuestion[];
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
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [hasShownTimeAlert, setHasShownTimeAlert] = useState(false);
  const submitLock = useRef(false);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);

  // Helper functions for localStorage timer
  const getTimerKey = (userEmail: string, quizId: string) => `quiz_timer_${userEmail}_${quizId}`;
  const getEndTimeKey = (userEmail: string, quizId: string) => `quiz_endTime_${userEmail}_${quizId}`;
  const getAnswersKey = (userEmail: string, quizId: string) => `quiz_answers_${userEmail}_${quizId}`;
  const getAnsweredQuestionsKey = (userEmail: string, quizId: string) => `quiz_answered_${userEmail}_${quizId}`;
  const getSkippedQuestionsKey = (userEmail: string, quizId: string) => `quiz_skipped_${userEmail}_${quizId}`;

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

  // Helper functions for localStorage answers
  const saveAnswersToStorage = (answers: Record<number, any>, answered: Set<number>, skipped: number[]) => {
    if (!user?.email) return;
    
    const answersKey = getAnswersKey(user.email, quizId);
    const answeredKey = getAnsweredQuestionsKey(user.email, quizId);
    const skippedKey = getSkippedQuestionsKey(user.email, quizId);
    
    localStorage.setItem(answersKey, JSON.stringify(answers));
    localStorage.setItem(answeredKey, JSON.stringify(Array.from(answered)));
    localStorage.setItem(skippedKey, JSON.stringify(skipped));
  };

  const loadAnswersFromStorage = (): { answers: Record<number, any>, answered: Set<number>, skipped: number[] } => {
    if (!user?.email) return { answers: {}, answered: new Set(), skipped: [] };
    
    const answersKey = getAnswersKey(user.email, quizId);
    const answeredKey = getAnsweredQuestionsKey(user.email, quizId);
    const skippedKey = getSkippedQuestionsKey(user.email, quizId);
    
    try {
      const storedAnswers = localStorage.getItem(answersKey);
      const storedAnswered = localStorage.getItem(answeredKey);
      const storedSkipped = localStorage.getItem(skippedKey);
      
      return {
        answers: storedAnswers ? JSON.parse(storedAnswers) : {},
        answered: storedAnswered ? new Set(JSON.parse(storedAnswered)) : new Set(),
        skipped: storedSkipped ? JSON.parse(storedSkipped) : []
      };
    } catch (err) {
      console.error('Error loading answers from storage:', err);
      return { answers: {}, answered: new Set(), skipped: [] };
    }
  };

  const clearStoredAnswers = () => {
    if (!user?.email) return;
    
    const answersKey = getAnswersKey(user.email, quizId);
    const answeredKey = getAnsweredQuestionsKey(user.email, quizId);
    const skippedKey = getSkippedQuestionsKey(user.email, quizId);
    
    localStorage.removeItem(answersKey);
    localStorage.removeItem(answeredKey);
    localStorage.removeItem(skippedKey);
  };

  // Enter fullscreen (must be called from user gesture)
  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        setIsFullscreen(true);
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
        setIsFullscreen(true);
      } else {
        // Fullscreen not supported
        toast.error('Fullscreen is not supported in your browser');
      }
    } catch (err: any) {
      // Handle permission denied or other errors gracefully
      if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
        toast.error('Fullscreen permission denied. Please allow fullscreen in your browser settings.');
      } else {
        console.error('Error entering fullscreen:', err);
        toast.error('Unable to enter fullscreen mode');
      }
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
          
          // Flatten questions from sections or use flat questions
          let questions: QuizQuestion[] = [];
          if (data.useSections && data.sections && Array.isArray(data.sections)) {
            questions = data.sections.flatMap((section: any) => section.questions || []);
          } else if (data.questions && Array.isArray(data.questions)) {
            questions = data.questions;
          }
          setAllQuestions(questions);
          
          // Load saved answers from localStorage
          const stored = loadAnswersFromStorage();
          const initialAnswers: Record<number, any> = { ...stored.answers };
          const initialAnswered = new Set(stored.answered);
          const initialSkipped = [...stored.skipped];
          
          // Initialize answers for reorder questions (shuffle the order) only if not already stored
          questions.forEach((q, index) => {
            if (q.questionType === 'reorder' && q.correctOrder && !(index in initialAnswers)) {
              // Shuffle the order for the student to rearrange
              const shuffled = [...q.correctOrder].sort(() => Math.random() - 0.5);
              initialAnswers[index] = shuffled;
              // Don't mark as answered - user hasn't interacted yet
            }
          });
          
          setAnswers(initialAnswers);
          setAnsweredQuestions(initialAnswered);
          setSkippedQuestions(initialSkipped);
          
          const durationMinutes = data.durationMinutes || 30;
          const initialTimeLeft = getStoredTimer(durationMinutes);
          setTimeLeft(initialTimeLeft);
          storeTimer(initialTimeLeft);
          
          // Don't auto-enter fullscreen - browsers require user gesture
          // User can click the "Enter Fullscreen" button if they want
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

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (quiz && allQuestions.length > 0 && user?.email && !loading) {
      saveAnswersToStorage(answers, answeredQuestions, skippedQuestions);
    }
  }, [answers, answeredQuestions, skippedQuestions, quiz, allQuestions.length, user?.email, loading]);

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

  const handleAnswerChange = (qIndex: number, answer: any) => {
    if (submitted) return;
    
    setAnswers((prev) => ({ ...prev, [qIndex]: answer }));
    
    // Mark as answered only if answer is not null/undefined
    if (answer !== null && answer !== undefined) {
      setAnsweredQuestions((prev) => {
        const newAnswered = new Set(prev);
        newAnswered.add(qIndex);
        return newAnswered;
      });
      // Remove from skipped if it was skipped
      if (skippedQuestions.includes(qIndex)) {
        setSkippedQuestions((prev) => prev.filter(idx => idx !== qIndex));
      }
    } else {
      // If answer is cleared, remove from answered
      setAnsweredQuestions((prev) => {
        const newAnswered = new Set(prev);
        newAnswered.delete(qIndex);
        return newAnswered;
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: null }));
    
    if (!skippedQuestions.includes(currentQuestion)) {
      setSkippedQuestions(prev => [...prev, currentQuestion]);
    }
    
    // Remove from answered if it was answered
    setAnsweredQuestions(prev => {
      const newAnswered = new Set(prev);
      newAnswered.delete(currentQuestion);
      return newAnswered;
    });
    
    if (currentQuestion < allQuestions.length - 1) {
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

      const initialTime = quiz.durationMinutes * 60;
      const timeSpentInSeconds = initialTime - (timeLeft || 0);

      // Convert answers to the format expected by backend
      const formattedAnswers: Record<string, any> = {};
      Object.keys(answers).forEach((key) => {
        const qIndex = parseInt(key);
        const answer = answers[qIndex];
        if (answer !== null && answer !== undefined) {
          formattedAnswers[qIndex.toString()] = answer;
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

        try {
          if (document.fullscreenElement) {
            exitFullscreen();
          }
        } catch (err) {
          console.error('Error exiting fullscreen:', err);
        }

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

  // Render question based on type
  const renderQuestion = (question: QuizQuestion, qIndex: number) => {
    const currentAnswer = answers[qIndex];

    switch (question.questionType) {
      case 'multiple_choice_single':
      case 'true_false':
        return (
          <div className="space-y-3">
            {question.options?.map((option, optIndex) => {
              const selected = currentAnswer === optIndex;
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
                    name={`question-${qIndex}`}
                    value={optIndex}
                    checked={selected}
                    onChange={() => handleAnswerChange(qIndex, optIndex)}
                    className="hidden"
                  />
                  <span className="text-gray-900">{String.fromCharCode(65 + optIndex)}. {option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'multiple_choice_multiple':
        return (
          <div className="space-y-3">
            {question.options?.map((option, optIndex) => {
              const selected = Array.isArray(currentAnswer) && currentAnswer.includes(optIndex);
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
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                      const newAnswer = selected
                        ? current.filter((i: number) => i !== optIndex)
                        : [...current, optIndex];
                      handleAnswerChange(qIndex, newAnswer.length > 0 ? newAnswer : null);
                    }}
                    className="hidden"
                  />
                  <span className="text-gray-900">{String.fromCharCode(65 + optIndex)}. {option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'fill_in_blank':
        return (
          <div>
            <input
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );

      case 'match':
        return (
          <div className="space-y-4">
            {question.matchPairs?.map((pair, pairIndex) => (
              <div key={pairIndex} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 font-medium text-gray-700">{pair.left}</div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={Array.isArray(currentAnswer) ? (currentAnswer[pairIndex] || '') : ''}
                    onChange={(e) => {
                      const current = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
                      current[pairIndex] = e.target.value;
                      handleAnswerChange(qIndex, current);
                    }}
                    placeholder="Match with..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'reorder':
        const initialOrder = question.correctOrder || [];
        const currentOrder = Array.isArray(currentAnswer) && currentAnswer.length > 0 
          ? currentAnswer 
          : [...initialOrder]; // Start with original order, shuffled
        
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">Arrange the items in the correct order (use arrows to move items up or down):</p>
            {currentOrder.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-gray-500 font-medium w-8 text-center">{itemIndex + 1}</span>
                <div className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white">
                  {item}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (itemIndex > 0) {
                      const newOrder = [...currentOrder];
                      [newOrder[itemIndex], newOrder[itemIndex - 1]] = [newOrder[itemIndex - 1], newOrder[itemIndex]];
                      handleAnswerChange(qIndex, newOrder);
                    }
                  }}
                  disabled={itemIndex === 0}
                  className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (itemIndex < currentOrder.length - 1) {
                      const newOrder = [...currentOrder];
                      [newOrder[itemIndex], newOrder[itemIndex + 1]] = [newOrder[itemIndex + 1], newOrder[itemIndex]];
                      handleAnswerChange(qIndex, newOrder);
                    }
                  }}
                  disabled={itemIndex === currentOrder.length - 1}
                  className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded"
                >
                  ↓
                </button>
              </div>
            ))}
          </div>
        );

      case 'image_based':
        return (
          <div className="space-y-4">
            {question.imageUrl && (
              <div className="mb-4">
                <img 
                  src={question.imageUrl} 
                  alt="Question image" 
                  className="max-w-full h-auto rounded-lg border border-gray-300 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'p-4 bg-red-50 border border-red-200 rounded-lg text-red-700';
                    errorDiv.textContent = 'Failed to load image. Please check the image URL.';
                    target.parentNode?.appendChild(errorDiv);
                  }}
                />
              </div>
            )}
            {question.options && question.options.length > 0 ? (
              <div className="space-y-3">
                {question.options.map((option, optIndex) => {
                  const selected = currentAnswer === optIndex;
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
                        name={`question-${qIndex}`}
                        value={optIndex}
                        checked={selected}
                        onChange={() => handleAnswerChange(qIndex, optIndex)}
                        className="hidden"
                      />
                      <span className="text-gray-900">{String.fromCharCode(65 + optIndex)}. {option}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Question type not supported</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !quiz || allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Quiz not found or has no questions'}</p>
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

  const totalQuestions = allQuestions.length;
  const answeredCount = answeredQuestions.size;
  const currentQ = allQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Main Layout: Middle (Quiz) + Right (Info) */}
      <div className="flex">
        {/* Middle - Quiz Content (More Spacious) */}
        <div className="flex-1 min-w-0 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white p-10 rounded-lg shadow-lg">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {currentQ.marks || 1} mark{currentQ.marks !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="prose max-w-none">
                  <p className="text-lg mb-6 text-gray-800 whitespace-pre-wrap">{currentQ.questionText}</p>
                  {/* Show image if it's an image-based question and imageUrl exists */}
                  {currentQ.questionType === 'image_based' && currentQ.imageUrl && (
                    <div className="mb-6">
                      <img 
                        src={currentQ.imageUrl} 
                        alt="Question image" 
                        className="max-w-full h-auto rounded-lg border border-gray-300 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'p-4 bg-red-50 border border-red-200 rounded-lg text-red-700';
                          errorDiv.textContent = 'Failed to load image. Please check the image URL.';
                          target.parentNode?.appendChild(errorDiv);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                {renderQuestion(currentQ, currentQuestion)}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleAnswerChange(currentQuestion, null)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Clear Answer
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
                    className="border border-yellow-500 text-yellow-600 px-4 py-2 rounded hover:bg-yellow-50 transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentQuestion === totalQuestions - 1}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentQuestion === totalQuestions - 1 ? 'Last Question' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quiz Info, Timer, Questions, Submit */}
        <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col overflow-y-auto">
        {/* Quiz Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-sm text-gray-600">{quiz.description}</p>
          )}
        </div>

        {/* Timer */}
        <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <svg className="h-6 w-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-3xl font-bold tracking-wide ${
                timeLeft !== null && timeLeft <= 60 ? 'text-red-600' : 'text-purple-900'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <span className="text-xs font-semibold text-purple-700 tracking-widest uppercase">Time Remaining</span>
          </div>
        </div>

        {/* Quiz Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quiz Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">{quiz.durationMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-medium text-gray-900">{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Answered:</span>
              <span className="font-medium text-green-600">{answeredCount}</span>
            </div>
            {skippedQuestions.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Skipped:</span>
                <span className="font-medium text-yellow-600">{skippedQuestions.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 text-center">
            {answeredCount} of {totalQuestions} questions answered
          </p>
        </div>

        {/* Question Status Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">All Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {allQuestions.map((question, questionIndex) => {
              const isAnswered = answeredQuestions.has(questionIndex);
              const isSkipped = skippedQuestions.includes(questionIndex);
              const isCurrent = currentQuestion === questionIndex;
              const bgColor = isAnswered ? "bg-green-500" : isSkipped ? "bg-yellow-500" : "bg-gray-300";
              const content = (questionIndex + 1).toString();
              
              return (
                <button
                  key={questionIndex}
                  onClick={() => setCurrentQuestion(questionIndex)}
                  className={`${bgColor} h-10 w-10 rounded-md flex items-center justify-center font-medium text-white transition-colors hover:opacity-80 ${
                    isCurrent ? "ring-2 ring-purple-500 ring-offset-2" : ""
                  }`}
                  title={`Question ${questionIndex + 1}${isAnswered ? ' (Answered)' : isSkipped ? ' (Skipped)' : ' (Unattempted)'}`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-green-500"></span>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-yellow-500"></span>
              <span className="text-gray-600">Skipped</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-gray-300"></span>
              <span className="text-gray-600">Unattempted</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
                handleSubmit(false);
              }
            }}
            disabled={submitted || submitting}
          >
            {submitted ? 'Quiz Submitted' : submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
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
