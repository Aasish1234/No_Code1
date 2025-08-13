"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PenTool, FileText, Brain, MessageSquare, HelpCircle, CheckCircle2, Loader2, Wifi } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { QuizInterface } from "@/components/quiz-interface"
import { SummaryDashboard } from "@/components/summary-dashboard"

interface ProcessedContent {
  id: string
  title: string
  content: string
  wordCount: number
  status: "processing" | "completed" | "error"
  progress: number
  summary?: string
  extractedText?: string
  quizQuestions?: any[]
  headings?: string[]
  error?: string
}

export default function HomePage() {
  const [processedContent, setProcessedContent] = useState<ProcessedContent[]>([])
  const [activeTab, setActiveTab] = useState<"input" | "summary" | "chat" | "quiz">("input")
  const [textInput, setTextInput] = useState("")
  const [contentTitle, setContentTitle] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputMode, setInputMode] = useState<"text" | "upload">("text")
  const [dragActive, setDragActive] = useState(false)

  const processText = useCallback(async () => {
    if (!textInput.trim() || !contentTitle.trim()) return

    const newContent: ProcessedContent = {
      id: Math.random().toString(36).substr(2, 9),
      title: contentTitle,
      content: textInput,
      wordCount: textInput.trim().split(/\s+/).length,
      status: "processing",
      progress: 0,
    }

    setProcessedContent((prev) => [...prev, newContent])
    setIsProcessing(true)

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textInput,
          title: contentTitle,
        }),
      })

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`)
      }

      const processedData = await response.json()

      setProcessedContent((prev) =>
        prev.map((content) =>
          content.id === newContent.id
            ? {
                ...content,
                status: "completed",
                progress: 100,
                summary: processedData.summary,
                extractedText: processedData.text,
                quizQuestions: processedData.quizQuestions,
                headings: processedData.headings,
              }
            : content,
        ),
      )

      setTextInput("")
      setContentTitle("")
    } catch (error) {
      setProcessedContent((prev) =>
        prev.map((content) =>
          content.id === newContent.id
            ? {
                ...content,
                status: "error",
                progress: 0,
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : content,
        ),
      )
    } finally {
      setIsProcessing(false)
    }
  }, [textInput, contentTitle])

  const processFile = useCallback(async (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert("File size exceeds 10MB limit. Please choose a smaller file.")
      return
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload PDF, DOCX, or TXT files.")
      return
    }

    const newContent: ProcessedContent = {
      id: Math.random().toString(36).substr(2, 9),
      title: file.name,
      content: "",
      wordCount: 0,
      status: "processing",
      progress: 0,
    }

    setProcessedContent((prev) => [...prev, newContent])
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(errorData.error || `Upload failed: ${uploadResponse.statusText}`)
      }

      const uploadData = await uploadResponse.json()

      if (!uploadData.success || !uploadData.filePath) {
        throw new Error("Upload completed but file path is missing")
      }

      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath: uploadData.filePath,
          fileName: file.name,
        }),
      })

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({ error: "Processing failed" }))
        throw new Error(errorData.error || `Processing failed: ${processResponse.statusText}`)
      }

      const processedData = await processResponse.json()

      setProcessedContent((prev) =>
        prev.map((content) =>
          content.id === newContent.id
            ? {
                ...content,
                status: "completed",
                progress: 100,
                content: processedData.text || "",
                wordCount: processedData.wordCount || 0,
                summary: processedData.summary,
                extractedText: processedData.text,
                quizQuestions: processedData.quizQuestions,
                headings: processedData.headings,
              }
            : content,
        ),
      )
    } catch (error) {
      console.error("File processing error:", error)
      setProcessedContent((prev) =>
        prev.map((content) =>
          content.id === newContent.id
            ? {
                ...content,
                status: "error",
                progress: 0,
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : content,
        ),
      )
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        processFile(file)
      }
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        processFile(file)
      }
    },
    [processFile],
  )

  const getStatusIcon = (status: ProcessedContent["status"]) => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "error":
        return <div className="h-4 w-4 rounded-full bg-red-500" />
      default:
        return null
    }
  }

  const completedContent = processedContent.filter((c) => c.status === "completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">StudySphere</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              </div>
            </div>
            <nav className="flex gap-1">
              {[
                { id: "input", label: "Input", icon: PenTool },
                { id: "summary", label: "Summary", icon: FileText, badge: completedContent.length > 0 },
                { id: "chat", label: "Chat", icon: MessageSquare, badge: completedContent.length > 0 },
                { id: "quiz", label: "Quiz", icon: HelpCircle, badge: completedContent.length > 0 },
              ].map(({ id, label, icon: Icon, badge }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(id as any)}
                  className={`relative ${activeTab === id ? "bg-cyan-600 hover:bg-cyan-700" : ""}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                  {badge && <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "input" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">Your AI-Powered Study Companion</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Learn Smarter, Not Harder. Upload documents or write content directly for AI-powered summaries, quizzes,
                and instant answers.
              </p>
            </div>

            {/* Input Mode Selector */}
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-lg p-1 shadow-sm border">
                  <Button
                    variant={inputMode === "text" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setInputMode("text")}
                    className={inputMode === "text" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Write Text
                  </Button>
                  <Button
                    variant={inputMode === "upload" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setInputMode("upload")}
                    className={inputMode === "upload" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </div>

            {/* Conditional Rendering based on Input Mode */}
            {inputMode === "text" ? (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-cyan-600" />
                    Write Your Study Content
                  </CardTitle>
                  <CardDescription>
                    Paste your notes, articles, or any text content for instant AI analysis and study tools.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Content Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={contentTitle}
                      onChange={(e) => setContentTitle(e.target.value)}
                      placeholder="Enter a title for your content..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Study Content
                    </label>
                    <Textarea
                      id="content"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your study materials, notes, articles, or any text content here..."
                      className="min-h-[300px] resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {textInput.trim() ? `${textInput.trim().split(/\s+/).length} words` : "0 words"}
                      </p>
                      <Button
                        onClick={processText}
                        disabled={!textInput.trim() || !contentTitle.trim() || isProcessing}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-600" />
                    Upload Study Documents
                  </CardTitle>
                  <CardDescription>
                    Upload PDF, DOCX, or TXT files for instant AI analysis and study tools.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-300 hover:border-cyan-400 hover:bg-gray-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="h-8 w-8 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {dragActive ? "Drop your file here" : "Upload your study materials"}
                        </h3>
                        <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileSelect}
                          disabled={isProcessing}
                        />
                        <label htmlFor="file-upload">
                          <Button
                            as="span"
                            disabled={isProcessing}
                            className="bg-cyan-600 hover:bg-cyan-700 cursor-pointer"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Choose File
                              </>
                            )}
                          </Button>
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Processing Status */}
            {processedContent.length > 0 && (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle>AI Processing Status</CardTitle>
                  <CardDescription>Live AI analysis of your study content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {processedContent.map((content) => (
                    <div key={content.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(content.status)}
                          <div>
                            <p className="font-medium text-gray-900">{content.title}</p>
                            <p className="text-sm text-gray-500">{content.wordCount} words</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            content.status === "completed"
                              ? "default"
                              : content.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {content.status === "processing"
                            ? "AI Processing"
                            : content.status === "completed"
                              ? "Ready"
                              : "Error"}
                        </Badge>
                      </div>

                      {content.status === "processing" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">AI is analyzing your content...</span>
                            <span className="text-gray-600">Processing...</span>
                          </div>
                          <Progress value={50} className="h-2" />
                        </div>
                      )}

                      {content.status === "completed" && content.summary && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800 font-medium mb-1">✓ Analysis Complete</p>
                          <p className="text-sm text-green-700">{content.summary}</p>
                        </div>
                      )}

                      {content.status === "error" && content.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-800 font-medium mb-1">✗ Processing Failed</p>
                          <p className="text-sm text-red-700">{content.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Features Preview */}
            {completedContent.length === 0 && (
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-6 w-6 text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smart Summaries</h3>
                    <p className="text-sm text-gray-600">
                      Get instant AI-generated summaries of your study materials with key points highlighted.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                    <p className="text-sm text-gray-600">
                      Ask questions anytime and get instant answers tailored to your learning style.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <HelpCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Interactive Quizzes</h3>
                    <p className="text-sm text-gray-600">
                      Test your knowledge with personalized quizzes that adapt to your progress.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Summary Dashboard */}
        {activeTab === "summary" && (
          <div className="max-w-6xl mx-auto">
            <SummaryDashboard
              files={completedContent}
              onNavigateToChat={() => setActiveTab("chat")}
              onNavigateToQuiz={() => setActiveTab("quiz")}
            />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto">
            <ChatInterface files={completedContent} />
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="max-w-4xl mx-auto">
            <QuizInterface files={completedContent} />
          </div>
        )}
      </main>
    </div>
  )
}
