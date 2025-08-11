"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Brain, HelpCircle, Lightbulb, Loader2, Upload, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StudyResponse {
  summary: string[]
  quiz: Array<{
    question: string
    options: string[]
    correctAnswer: string
  }>
  explanation: string
  flashcards?: Array<{
    front: string
    back: string
  }>
}

interface ProcessingOptions {
  summarize: boolean
  quiz: boolean
  flashcards: boolean
  chat: boolean
}

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [inputText, setInputText] = useState("")
  const [response, setResponse] = useState<StudyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("text")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentTitle, setDocumentTitle] = useState("")
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    summarize: true,
    quiz: true,
    flashcards: false,
    chat: true,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleSubmit = async () => {
    if (!inputText.trim() && !selectedFile) {
      toast({
        title: "No content provided",
        description: "Please paste text or select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResponse(null)
    setSelectedAnswers({})
    setShowResults(false)

    try {
      // Simulate file processing
      if (selectedFile) {
        toast({
          title: "Processing file...",
          description: `Processing ${selectedFile.name} with AI`,
        })
      }

      const res = await fetch("/api/study-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText || `Sample content from ${selectedFile?.name || "uploaded file"}`,
          options: processingOptions,
          title: documentTitle,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to process content")
      }

      const data = await res.json()

      // Add flashcards if requested
      if (processingOptions.flashcards) {
        data.flashcards = [
          { front: "What is photosynthesis?", back: "The process by which plants make food using sunlight" },
          { front: "What gas do plants release?", back: "Oxygen" },
          { front: "What do plants need for photosynthesis?", back: "Carbon dioxide, water, and sunlight" },
        ]
      }

      setResponse(data)

      toast({
        title: "Processing complete!",
        description: "Your study materials are ready.",
      })
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Unable to process your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }))
  }

  const checkAnswers = () => {
    setShowResults(true)
  }

  const getScore = () => {
    if (!response) return 0
    let correct = 0
    response.quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Study Material</h1>
            <p className="text-gray-600">Transform your documents into interactive study materials</p>
          </div>

          {/* Upload Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Upload Method</CardTitle>
              <CardDescription>Select how you'd like to add your study material</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={uploadMethod === "text" ? "default" : "outline"}
                  onClick={() => setUploadMethod("text")}
                  className="h-20 flex flex-col gap-2"
                >
                  <FileText className="h-6 w-6" />
                  <span>Paste Text</span>
                </Button>
                <Button
                  variant={uploadMethod === "file" ? "default" : "outline"}
                  onClick={() => setUploadMethod("file")}
                  className="h-20 flex flex-col gap-2"
                >
                  <Upload className="h-6 w-6" />
                  <span>Upload File</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Processing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Options</CardTitle>
              <CardDescription>Choose what you'd like to generate from your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="summarize"
                    checked={processingOptions.summarize}
                    onCheckedChange={(checked) =>
                      setProcessingOptions((prev) => ({ ...prev, summarize: checked as boolean }))
                    }
                  />
                  <Label htmlFor="summarize" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Summary
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quiz"
                    checked={processingOptions.quiz}
                    onCheckedChange={(checked) =>
                      setProcessingOptions((prev) => ({ ...prev, quiz: checked as boolean }))
                    }
                  />
                  <Label htmlFor="quiz" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Quiz
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flashcards"
                    checked={processingOptions.flashcards}
                    onCheckedChange={(checked) =>
                      setProcessingOptions((prev) => ({ ...prev, flashcards: checked as boolean }))
                    }
                  />
                  <Label htmlFor="flashcards" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Flashcards
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chat"
                    checked={processingOptions.chat}
                    onCheckedChange={(checked) =>
                      setProcessingOptions((prev) => ({ ...prev, chat: checked as boolean }))
                    }
                  />
                  <Label htmlFor="chat" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Enable Chat
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Input Method */}
          {uploadMethod === "text" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Material Input
                </CardTitle>
                <CardDescription>Paste your study material here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your document"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="Paste your study material here... For example: biology notes about photosynthesis, history chapter about World War II, physics concepts about gravity, etc."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <Button onClick={handleSubmit} disabled={!inputText.trim() || isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Study Materials
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* File Upload Method */}
          {uploadMethod === "file" && (
            <Card>
              <CardHeader>
                <CardTitle>File Upload</CardTitle>
                <CardDescription>Upload documents, images, or videos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-title">Document Title</Label>
                  <Input
                    id="file-title"
                    placeholder="Enter a title for your document"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {selectedFile ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null)
                          setDocumentTitle("")
                        }}
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                      <p className="text-sm text-gray-500 mb-4">Supports PDF, DOC, TXT, JPG, PNG, MP4</p>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov"
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload">
                        <Button asChild>
                          <span>Choose Files</span>
                        </Button>
                      </Label>
                    </>
                  )}
                </div>

                {selectedFile && (
                  <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Process Document
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {response && (
            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Quiz
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Explanation
                </TabsTrigger>
                {response.flashcards && (
                  <TabsTrigger value="flashcards" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Flashcards
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Points Summary</CardTitle>
                    <CardDescription>Main ideas and important concepts from your study material</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {response.summary.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quiz">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Check Quiz</CardTitle>
                    <CardDescription>Test your understanding with these questions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {response.quiz.map((q, questionIndex) => (
                      <div key={questionIndex} className="space-y-3">
                        <h3 className="font-semibold text-lg">
                          Q{questionIndex + 1}: {q.question}
                        </h3>
                        <div className="grid gap-2">
                          {q.options.map((option, optionIndex) => {
                            const letter = String.fromCharCode(65 + optionIndex)
                            const isSelected = selectedAnswers[questionIndex] === letter
                            const isCorrect = q.correctAnswer === letter
                            const showResult = showResults

                            return (
                              <button
                                key={optionIndex}
                                onClick={() => handleAnswerSelect(questionIndex, letter)}
                                disabled={showResults}
                                className={`p-3 text-left rounded-lg border transition-colors ${
                                  showResult
                                    ? isCorrect
                                      ? "bg-green-100 border-green-500 text-green-800"
                                      : isSelected
                                        ? "bg-red-100 border-red-500 text-red-800"
                                        : "bg-gray-50 border-gray-200"
                                    : isSelected
                                      ? "bg-blue-100 border-blue-500"
                                      : "bg-white border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <span className="font-medium">{letter})</span> {option}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-4 border-t">
                      {!showResults ? (
                        <Button
                          onClick={checkAnswers}
                          disabled={Object.keys(selectedAnswers).length !== response.quiz.length}
                        >
                          Check Answers
                        </Button>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="text-lg px-4 py-2">
                            Score: {getScore()}/{response.quiz.length}
                          </Badge>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedAnswers({})
                              setShowResults(false)
                            }}
                          >
                            Try Again
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="explanation">
                <Card>
                  <CardHeader>
                    <CardTitle>Simple Explanation</CardTitle>
                    <CardDescription>The same concepts explained in easy-to-understand language</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none">
                      {response.explanation.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {response.flashcards && (
                <TabsContent value="flashcards">
                  <Card>
                    <CardHeader>
                      <CardTitle>Flashcards</CardTitle>
                      <CardDescription>Study with these interactive flashcards</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {response.flashcards.map((card, index) => (
                          <div key={index} className="group perspective-1000">
                            <div className="relative w-full h-32 transform-style-preserve-3d transition-transform duration-500 group-hover:rotate-y-180">
                              <div className="absolute inset-0 w-full h-full backface-hidden bg-blue-100 border border-blue-200 rounded-lg p-4 flex items-center justify-center">
                                <p className="text-center font-medium text-blue-900">{card.front}</p>
                              </div>
                              <div className="absolute inset-0 w-full h-full backface-hidden bg-green-100 border border-green-200 rounded-lg p-4 flex items-center justify-center rotate-y-180">
                                <p className="text-center font-medium text-green-900">{card.back}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}

          {!response && !isLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Transform Your Study Material</h3>
                <p className="text-gray-500">
                  Upload documents or paste content to generate summaries, quizzes, and more
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
