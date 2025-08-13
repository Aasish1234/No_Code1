"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw, ChevronRight } from "lucide-react"

interface QuizQuestion {
  id: number
  type: "multiple_choice" | "true_false" | "short_answer"
  question: string
  options?: string[]
  correct_answer: number | boolean | string[]
  explanation: string
}

interface ProcessedFile {
  id: string
  name: string
  quizQuestions?: QuizQuestion[]
}

interface QuizInterfaceProps {
  files: ProcessedFile[]
}

interface QuizState {
  currentQuestion: number
  answers: Record<number, any>
  showExplanation: boolean
  quizCompleted: boolean
  score: number
  timeStarted: number
  timeElapsed: number
}

export function QuizInterface({ files }: QuizInterfaceProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    showExplanation: false,
    quizCompleted: false,
    score: 0,
    timeStarted: Date.now(),
    timeElapsed: 0,
  })

  const [currentAnswer, setCurrentAnswer] = useState<any>("")
  const [timer, setTimer] = useState(0)

  // Get all quiz questions from processed files
  const allQuestions = files.flatMap((file) => file.quizQuestions || [])

  // Timer effect
  useEffect(() => {
    if (!quizState.quizCompleted) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - quizState.timeStarted) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [quizState.quizCompleted, quizState.timeStarted])

  const currentQuestion = allQuestions[quizState.currentQuestion]

  const handleAnswerSubmit = () => {
    if (!currentQuestion) return

    const isCorrect = checkAnswer(currentQuestion, currentAnswer)

    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: { answer: currentAnswer, correct: isCorrect } },
      showExplanation: true,
      score: isCorrect ? prev.score + 1 : prev.score,
    }))
  }

  const checkAnswer = (question: QuizQuestion, answer: any): boolean => {
    switch (question.type) {
      case "multiple_choice":
        return Number(answer) === question.correct_answer
      case "true_false":
        // Ensure correct_answer exists before converting to string
        return answer === (question.correct_answer !== undefined ? question.correct_answer.toString() : "")
      case "short_answer":
        const correctAnswers = Array.isArray(question.correct_answer)
          ? question.correct_answer
          : [question.correct_answer]
        // Filter out undefined values and ensure they exist before calling toString()
        return correctAnswers
          .filter((correct) => correct !== undefined && correct !== null)
          .some((correct) => {
            const correctStr = correct.toString().toLowerCase()
            const answerStr = (answer || "").toString().toLowerCase()
            return answerStr.includes(correctStr)
          })
      default:
        return false
    }
  }

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < allQuestions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        showExplanation: false,
      }))
      setCurrentAnswer("")
    } else {
      setQuizState((prev) => ({
        ...prev,
        quizCompleted: true,
        timeElapsed: Math.floor((Date.now() - prev.timeStarted) / 1000),
      }))
    }
  }

  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      showExplanation: false,
      quizCompleted: false,
      score: 0,
      timeStarted: Date.now(),
      timeElapsed: 0,
    })
    setCurrentAnswer("")
    setTimer(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { label: "Excellent!", variant: "default" as const }
    if (percentage >= 80) return { label: "Great Job!", variant: "default" as const }
    if (percentage >= 70) return { label: "Good Work!", variant: "secondary" as const }
    if (percentage >= 60) return { label: "Keep Practicing!", variant: "secondary" as const }
    return { label: "Need More Study", variant: "destructive" as const }
  }

  if (allQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Available</h3>
          <p className="text-gray-600 mb-4">Upload and process documents first to generate personalized quizzes.</p>
        </CardContent>
      </Card>
    )
  }

  if (quizState.quizCompleted) {
    const percentage = Math.round((quizState.score / allQuestions.length) * 100)
    const scoreBadge = getScoreBadge(percentage)

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                {quizState.score}/{allQuestions.length}
              </div>
              <div className={`text-2xl font-semibold ${getScoreColor(percentage)}`}>{percentage}%</div>
              <Badge variant={scoreBadge.variant} className="text-sm px-3 py-1">
                {scoreBadge.label}
              </Badge>
            </div>

            <div className="flex justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Time: {formatTime(quizState.timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Correct: {quizState.score}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Incorrect: {allQuestions.length - quizState.score}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Question Review</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {allQuestions.map((question, index) => {
                const userAnswer = quizState.answers[question.id]
                return (
                  <div key={question.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {userAnswer?.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Q{index + 1}: {question.question}
                      </p>
                      <p className="text-xs text-gray-500">{userAnswer?.correct ? "Correct" : "Incorrect"}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={resetQuiz} variant="outline" className="flex-1 bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
              <Trophy className="h-4 w-4 mr-2" />
              View Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-cyan-600" />
            Interactive Quiz
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timer)}</span>
            </div>
            <Badge variant="outline">
              {quizState.currentQuestion + 1} of {allQuestions.length}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(((quizState.currentQuestion + 1) / allQuestions.length) * 100)}%</span>
          </div>
          <Progress value={((quizState.currentQuestion + 1) / allQuestions.length) * 100} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentQuestion && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Question {quizState.currentQuestion + 1}</h3>
              <p className="text-gray-700 leading-relaxed">{currentQuestion.question}</p>
            </div>

            <div className="space-y-4">
              {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === "true_false" && (
                <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="cursor-pointer">
                        False
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === "short_answer" && (
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[100px]"
                />
              )}
            </div>

            {quizState.showExplanation && (
              <div
                className={`p-4 rounded-lg border ${
                  quizState.answers[currentQuestion.id]?.correct
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {quizState.answers[currentQuestion.id]?.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${
                      quizState.answers[currentQuestion.id]?.correct ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {quizState.answers[currentQuestion.id]?.correct ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    quizState.answers[currentQuestion.id]?.correct ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {!quizState.showExplanation ? (
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!currentAnswer}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  {quizState.currentQuestion < allQuestions.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <Trophy className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
