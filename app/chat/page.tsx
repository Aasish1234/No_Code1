"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Send, Bot, User, BookOpen, HelpCircle, Lightbulb, FileText } from "lucide-react"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  documentTitle?: string
  sources?: string[]
}

interface Document {
  id: string
  title: string
  status: "ready" | "processing"
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your AI study assistant. Select a document from the dropdown above, and I'll help you understand it better. You can ask me questions, request summaries, or get quiz questions!",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string>("")
  const [documents] = useState<Document[]>([
    { id: "1", title: "Biology Chapter 5: Photosynthesis", status: "ready" },
    { id: "2", title: "Chemistry Notes - Organic Compounds", status: "ready" },
    { id: "3", title: "Physics Lecture 12", status: "processing" },
  ])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response with RAG
    setTimeout(() => {
      const selectedDoc = documents.find((doc) => doc.id === selectedDocument)
      let response = ""
      let sources: string[] = []

      if (!selectedDocument) {
        response =
          "Please select a document from the dropdown above so I can provide specific answers about your content. Once you select a document, I'll be able to answer questions based on that material."
      } else if (inputMessage.toLowerCase().includes("summarize")) {
        response = `Here's a summary of "${selectedDoc?.title}": This document covers the fundamental concepts and processes. The main points include key definitions, important processes, and practical applications. The content is structured to build understanding progressively.`
        sources = ["Page 1-3", "Section 2.1", "Conclusion"]
      } else if (inputMessage.toLowerCase().includes("quiz")) {
        response = `I can create a quiz based on "${selectedDoc?.title}". Would you like multiple choice, true/false, or short answer questions? I can generate questions covering the main concepts, definitions, and applications discussed in the document.`
        sources = ["Chapter Overview", "Key Concepts"]
      } else {
        response = `Based on "${selectedDoc?.title}", I can help answer that question. The document contains relevant information about this topic. Let me provide you with a detailed explanation based on the content.`
        sources = ["Section 1.2", "Page 5", "Figure 3"]
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
        documentTitle: selectedDoc?.title,
        sources,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat with Your Documents</h1>
            <p className="text-gray-600">Ask questions about your study materials and get instant answers</p>
          </div>

          {/* Document Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Document
              </CardTitle>
              <CardDescription>Choose which document you'd like to chat about</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a document to chat about" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} disabled={doc.status === "processing"}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{doc.title}</span>
                          {doc.status === "processing" && (
                            <Badge variant="secondary" className="ml-2">
                              Processing
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => router.push("/upload")}>
                  Upload New
                </Button>
              </div>
              {!selectedDocument && (
                <p className="text-sm text-gray-500 mt-2">
                  Select a document to enable AI-powered chat with retrieval-augmented generation (RAG)
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Messages */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat History
                    {selectedDocument && (
                      <Badge variant="secondary" className="ml-2">
                        RAG Enabled
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div
                            className={`rounded-lg p-3 ${
                              message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-300">
                                <p className="text-xs text-gray-600 mb-1">Sources:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.sources.map((source, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p
                              className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={
                        selectedDocument
                          ? "Ask a question about your document..."
                          : "Select a document first to start chatting..."
                      }
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Questions</CardTitle>
                  <CardDescription>Common questions to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleQuickQuestion("Summarize this document")}
                    disabled={!selectedDocument}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Summarize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleQuickQuestion("Create a quiz from this content")}
                    disabled={!selectedDocument}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleQuickQuestion("What are the key concepts?")}
                    disabled={!selectedDocument}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Key Concepts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleQuickQuestion("Explain this in simple terms")}
                    disabled={!selectedDocument}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Simplify
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">RAG-powered responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Source citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Context-aware answers</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Messages today</span>
                    <Badge variant="secondary">{messages.length - 1}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Documents available</span>
                    <Badge variant="secondary">{documents.filter((d) => d.status === "ready").length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg response time</span>
                    <Badge variant="secondary">1.5s</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
